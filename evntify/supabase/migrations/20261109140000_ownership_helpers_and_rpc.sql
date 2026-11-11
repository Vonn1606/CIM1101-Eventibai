-- ============================================================================
-- Migration: Ownership helpers, RLS roster privacy & RPC functions
-- ============================================================================

-- ---------- Ownership helper (creator, org member, or admin) ----------
create or replace function public.user_owns_event(p_event uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.events e
    where e.id = p_event
      and (
        e.created_by = auth.uid()
        or public.is_admin()
        or public.current_role_is('admin')
        or exists (
          select 1 from public.organization_members m
          where m.organization_id = e.organization_id
            and m.user_id = auth.uid()
        )
      )
  );
$$;

-- ---------- Registrations: organizers only see their own events' rosters ----------
drop policy if exists "see own registrations" on public.registrations;
create policy "see own registrations" on public.registrations for select
  using (user_id = auth.uid() or public.user_owns_event(event_id));

-- ---------- Check-ins ----------
drop policy if exists "staff manage check-ins" on public.check_ins;
drop policy if exists "owners manage check-ins" on public.check_ins;
create policy "owners manage check-ins" on public.check_ins for all
  using (public.user_owns_event(event_id))
  with check (public.user_owns_event(event_id));

-- ---------- Broadcasts: scoped to owned events (admins see all) ----------
drop policy if exists "staff send broadcasts" on public.broadcasts;
drop policy if exists "owners read broadcasts" on public.broadcasts;
drop policy if exists "owners insert broadcasts" on public.broadcasts;
create policy "owners read broadcasts" on public.broadcasts for select
  using (public.current_role_is('admin') or (event_id is not null and public.user_owns_event(event_id)));
create policy "owners insert broadcasts" on public.broadcasts for insert
  with check (sent_by = auth.uid() and event_id is not null and public.user_owns_event(event_id));

-- ---------- Audit log: no direct inserts, only via function ----------
drop policy if exists "staff write audit" on public.audit_logs;

create or replace function public.log_audit(p_action text, p_entity text, p_entity_id uuid, p_meta jsonb default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.current_role_is('admin') or public.current_role_is('organizer')) then
    raise exception 'not allowed';
  end if;
  insert into public.audit_logs (actor_id, action, entity, entity_id, meta)
  values (auth.uid(), p_action, p_entity, p_entity_id, p_meta);
end $$;

-- ---------- decide_approval: one transaction, admin only, must be pending ----------
create or replace function public.decide_approval(p_approval uuid, p_decision public.approval_status, p_note text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_ap public.event_approvals;
begin
  if not (public.is_admin() or public.current_role_is('admin')) then
    raise exception 'admin only';
  end if;
  if p_decision not in ('approved','returned','declined') then
    raise exception 'invalid decision';
  end if;

  select * into v_ap from public.event_approvals where id = p_approval for update;
  if not found then raise exception 'approval not found'; end if;
  if v_ap.decision <> 'pending' then raise exception 'already decided'; end if;

  update public.event_approvals
     set decision = p_decision, decision_note = p_note,
         reviewed_by = auth.uid(), decided_at = now()
   where id = p_approval;

  update public.events
     set approval = p_decision,
         status = case when p_decision = 'approved' then 'open'::public.event_status else status end  -- assumption: approved => open
   where id = v_ap.event_id;

  if v_ap.submitted_by is not null then
    insert into public.notifications (user_id, title, body, link)
    values (v_ap.submitted_by, 'Event proposal ' || p_decision::text, p_note, '/organizer-dashboard');
  end if;

  insert into public.audit_logs (actor_id, action, entity, entity_id, meta)
  values (auth.uid(), 'proposal.' || p_decision::text, 'event', v_ap.event_id,
          jsonb_build_object('approval_id', p_approval, 'note', p_note));
end $$;

-- ---------- suspend_event: admin only ----------
create or replace function public.suspend_event(p_event uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_admin() or public.current_role_is('admin')) then
    raise exception 'admin only';
  end if;
  update public.events set status = 'suspended' where id = p_event;
  insert into public.audit_logs (actor_id, action, entity, entity_id, meta)
  values (auth.uid(), 'event.suspend', 'event', p_event, jsonb_build_object('reason', p_reason));
end $$;

-- ---------- send_broadcast: ownership, fan-out, honest statuses ----------
create or replace function public.send_broadcast(
  p_event uuid, p_cohort text, p_message text, p_channels public.broadcast_channel[]
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_count int;
  v_title text;
begin
  if not public.user_owns_event(p_event) then
    raise exception 'not allowed';
  end if;
  select title into v_title from public.events where id = p_event;

  select count(*) into v_count from public.registrations
   where event_id = p_event and status = 'registered';

  insert into public.broadcasts (event_id, sent_by, cohort_label, message, channels, recipient_count)
  values (p_event, auth.uid(), p_cohort, p_message, p_channels, v_count)
  returning id into v_id;

  -- in-app push: a notification row is the delivery
  if 'push' = any (p_channels) then
    insert into public.notifications (user_id, title, body, link)
    select r.user_id, v_title, p_message, '/events/' || (select slug from public.events where id = p_event)
      from public.registrations r where r.event_id = p_event and r.status = 'registered';
  end if;

  -- one delivery row per recipient/channel; only push counts as delivered
  insert into public.broadcast_deliveries (broadcast_id, user_id, channel, status, delivered_at)
  select v_id, r.user_id, c,
         case when c = 'push' then 'delivered'::public.delivery_status else 'queued'::public.delivery_status end,
         case when c = 'push' then now() end
    from public.registrations r, unnest(p_channels) c
   where r.event_id = p_event and r.status = 'registered';

  insert into public.audit_logs (actor_id, action, entity, entity_id, meta)
  values (auth.uid(), 'broadcast.send', 'event', p_event, jsonb_build_object('broadcast_id', v_id));
  return v_id;
end $$;

-- ---------- Public visibility: hide suspended events ----------
drop policy if exists "public sees approved events" on public.events;
create policy "public sees approved events" on public.events for select
  using (
    (approval = 'approved' and status not in ('draft','suspended'))
    or created_by = auth.uid()
    or public.is_admin()
    or public.current_role_is('admin')
  );

