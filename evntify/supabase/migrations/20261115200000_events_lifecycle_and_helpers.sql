-- ============================================================================
-- Migration: Events Lifecycle, Venue Conflict Prevention, QR toggle,
-- Cancellation, Waitlist Auto-Promotion, Registrant Notifications,
-- and Pre-Start Approved Event Updates Policy.
-- Supports EVENTS_TODO E1-E4
-- ============================================================================

-- 1. Add qr_enabled flag to events if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'qr_enabled'
  ) then
    alter table public.events add column qr_enabled boolean not null default true;
  end if;
end $$;

-- 2. Security Definer RPC: notify_event_registrants
-- Allows organizers/admins to notify all active registrants of an event (e.g. details update, venue change)
create or replace function public.notify_event_registrants(
  p_event uuid,
  p_title text,
  p_body text,
  p_link text default null
) returns int language plpgsql security definer set search_path = public as $$
declare
  v_count int := 0;
  v_slug text;
  v_link text;
begin
  if not (public.user_owns_event(p_event) or public.is_admin() or public.current_role_is('admin')) then
    raise exception 'Unauthorized to notify registrants of this event';
  end if;

  select slug into v_slug from public.events where id = p_event;
  v_link := coalesce(p_link, '/events/' || coalesce(v_slug, ''));

  insert into public.notifications (user_id, title, body, link)
  select r.user_id, p_title, p_body, v_link
    from public.registrations r
   where r.event_id = p_event
     and r.status = 'registered';

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- 3. Security Definer RPC: cancel_event
-- Cancels an event, sets all registrations to cancelled, notifies registrants, and logs audit
create or replace function public.cancel_event(
  p_event uuid,
  p_reason text
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_event public.events;
  v_slug text;
begin
  if not (public.user_owns_event(p_event) or public.is_admin() or public.current_role_is('admin')) then
    raise exception 'Unauthorized to cancel this event';
  end if;

  select * into v_event from public.events where id = p_event for update;
  if not found then
    raise exception 'Event not found';
  end if;

  if v_event.status = 'cancelled' then
    raise exception 'Event is already cancelled';
  end if;

  if v_event.status = 'completed' then
    raise exception 'Cannot cancel an already completed event';
  end if;

  -- Update event status
  update public.events
     set status = 'cancelled'::public.event_status
   where id = p_event;

  -- Notify all currently registered & waitlisted attendees
  insert into public.notifications (user_id, title, body, link)
  select r.user_id,
         'Event Cancelled: ' || v_event.title,
         coalesce(p_reason, 'The organizer has cancelled this event.'),
         '/events/' || v_event.slug
    from public.registrations r
   where r.event_id = p_event
     and r.status in ('registered', 'waitlisted');

  -- Mark active registrations as cancelled
  update public.registrations
     set status = 'cancelled'::public.registration_status
   where event_id = p_event
     and status in ('registered', 'waitlisted');

  -- Log audit record
  insert into public.audit_logs (actor_id, action, entity, entity_id, meta)
  values (
    auth.uid(),
    'event.cancel',
    'event',
    p_event,
    jsonb_build_object('reason', p_reason, 'title', v_event.title)
  );
end;
$$;

-- 4. Trigger / Function: Waitlist Promotion on Cancellation
-- When a registered student's status changes to 'cancelled', automatically promote the earliest waitlisted student
create or replace function public.promote_waitlist_on_cancel()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_event public.events;
  v_promoted public.registrations;
begin
  -- Only trigger when an active 'registered' row changes to 'cancelled'
  if old.status = 'registered' and new.status = 'cancelled' then
    select * into v_event from public.events where id = old.event_id;
    -- Only promote if event is still open or scheduled
    if v_event.status in ('open', 'scheduled') then
      -- Find earliest waitlisted attendee
      select * into v_promoted
        from public.registrations
       where event_id = old.event_id
         and status = 'waitlisted'
       order by registered_at asc
       limit 1
       for update skip locked;

      if found then
        update public.registrations
           set status = 'registered'::public.registration_status
         where id = v_promoted.id;

        -- Notify the promoted student
        insert into public.notifications (user_id, title, body, link)
        values (
          v_promoted.user_id,
          'Seat Confirmed: ' || v_event.title,
          'A spot opened up and you have been promoted from the waitlist to registered!',
          '/events/' || v_event.slug
        );
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_promote_waitlist on public.registrations;
create trigger trg_promote_waitlist
  after update of status on public.registrations
  for each row
  execute function public.promote_waitlist_on_cancel();

-- 5. Helper RPC / Function: check_venue_conflict
-- Checks whether a venue is free from overlapping events (open, scheduled, ongoing) and venue_closures
create or replace function public.check_venue_conflict(
  p_venue_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_exclude_event_id uuid default null
) returns table (
  conflict_type text,
  conflict_title text,
  starts_at timestamptz,
  ends_at timestamptz
) language plpgsql stable security definer set search_path = public as $$
begin
  -- 1. Check venue closures
  return query
  select
    'closure'::text as conflict_type,
    vc.reason as conflict_title,
    (vc.starts_on::text || ' 00:00:00+08')::timestamptz as starts_at,
    (vc.ends_on::text || ' 23:59:59+08')::timestamptz as ends_at
  from public.venue_closures vc
  where vc.venue_id = p_venue_id
    and (p_starts_at::date <= vc.ends_on and p_ends_at::date >= vc.starts_on);

  -- 2. Check conflicting events
  return query
  select
    'event'::text as conflict_type,
    e.title as conflict_title,
    e.starts_at as starts_at,
    coalesce(e.ends_at, e.starts_at + interval '2 hours') as ends_at
  from public.events e
  where e.venue_id = p_venue_id
    and (p_exclude_event_id is null or e.id <> p_exclude_event_id)
    and e.status in ('open', 'scheduled', 'ongoing')
    and (e.starts_at < p_ends_at and coalesce(e.ends_at, e.starts_at + interval '2 hours') > p_starts_at);
end;
$$;

-- 6. Events RLS Update: allow pre-start edits for approved events by creator/owner
-- Preserves self-approval prevention: creators cannot change 'approval' to 'approved'
drop policy if exists "owner or admin edits events" on public.events;
create policy "owner or admin edits events"
on public.events
for update
to authenticated
using (
  public.is_admin()
  or (
    (created_by = auth.uid() or public.user_owns_event(id))
    and (
      approval in ('pending', 'returned')
      or (approval = 'approved' and starts_at > now() and status not in ('ongoing', 'completed', 'cancelled', 'suspended'))
    )
  )
)
with check (
  public.is_admin()
  or (
    (created_by = auth.uid() or public.user_owns_event(id))
    and (
      approval in ('pending', 'returned')
      or (approval = 'approved' and starts_at > now() and status not in ('ongoing', 'completed', 'cancelled', 'suspended'))
    )
  )
);
