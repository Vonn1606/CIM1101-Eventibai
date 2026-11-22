-- ============================================================================
-- Migration: 20261122000002_resubmit_event_flow.sql
-- Description: Supports atomic resubmission of returned events, revisions,
--              change tracking (diffs), and cleanup of stale approval rows.
-- ============================================================================

-- 1. Add revision tracking and diff columns to event_approvals
alter table public.event_approvals
  add column if not exists revision        int         not null default 1,
  add column if not exists is_current      boolean     not null default true,
  add column if not exists changes         jsonb,
  add column if not exists supersedes_id   uuid references public.event_approvals(id) on delete set null,
  add column if not exists resubmitted_at  timestamptz;

-- Index for efficient current-approval lookups
create index if not exists idx_event_approvals_current
  on public.event_approvals (event_id, is_current);

-- 2. Atomic RPC for resubmitting a returned event
create or replace function public.resubmit_event(
  p_event uuid,
  p_updates jsonb,
  p_changes jsonb,
  p_memo text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_ap public.event_approvals%rowtype;
  v_new_revision int := 2;
  v_owns boolean;
  v_current_approval text;
begin
  -- Check ownership
  select public.user_owns_event(p_event) into v_owns;
  if not coalesce(v_owns, false) then
    raise exception 'You do not have permission to resubmit this event.';
  end if;

  -- Check event is currently in 'returned' state
  select approval into v_current_approval
    from public.events
   where id = p_event
   for update;

  if not found then
    raise exception 'Event not found.';
  end if;

  if v_current_approval <> 'returned' then
    raise exception 'Only returned events can be resubmitted for review.';
  end if;

  -- Apply allowed update fields to the event
  if p_updates ? 'title' then
    update public.events set title = (p_updates->>'title') where id = p_event;
  end if;
  if p_updates ? 'venue_id' then
    update public.events set venue_id = (p_updates->>'venue_id')::uuid where id = p_event;
  end if;
  if p_updates ? 'category' then
    update public.events set category = (p_updates->>'category') where id = p_event;
  end if;
  if p_updates ? 'total_capacity' then
    update public.events set total_capacity = (p_updates->>'total_capacity')::int where id = p_event;
  end if;
  if p_updates ? 'summary' then
    update public.events set summary = (p_updates->>'summary') where id = p_event;
  end if;
  if p_updates ? 'description' then
    update public.events
       set description = array(select jsonb_array_elements_text(p_updates->'description'))
     where id = p_event;
  end if;
  if p_updates ? 'starts_at' then
    update public.events set starts_at = (p_updates->>'starts_at')::timestamptz where id = p_event;
  end if;
  if p_updates ? 'ends_at' then
    update public.events set ends_at = (p_updates->>'ends_at')::timestamptz where id = p_event;
  end if;

  -- Set event approval to pending, status to draft
  update public.events
     set approval = 'pending',
         status = 'draft',
         updated_at = now()
   where id = p_event;

  -- Find previous current approval
  select * into v_old_ap
    from public.event_approvals
   where event_id = p_event and is_current = true
   order by submitted_at desc
   limit 1
   for update;

  if found then
    v_new_revision := coalesce(v_old_ap.revision, 1) + 1;
    update public.event_approvals
       set is_current = false
     where id = v_old_ap.id;
  end if;

  -- Insert new approval row as the current active one
  insert into public.event_approvals (
    event_id,
    submitted_by,
    brief,
    seats_expected,
    stage,
    decision,
    decision_note,
    revision,
    is_current,
    changes,
    supersedes_id,
    resubmitted_at
  ) values (
    p_event,
    auth.uid(),
    coalesce(p_updates->>'summary', v_old_ap.brief),
    coalesce((p_updates->>'total_capacity')::int, v_old_ap.seats_expected),
    'Awaiting Review',
    'pending',
    coalesce(p_memo, 'Resubmitted after edits'),
    v_new_revision,
    true,
    p_changes,
    v_old_ap.id,
    now()
  );

  -- Insert audit log
  insert into public.audit_logs (actor_id, action, entity, entity_id, meta)
  values (
    auth.uid(),
    'event.resubmit',
    'events',
    p_event,
    jsonb_build_object('revision', v_new_revision, 'changes', p_changes, 'memo', p_memo)
  );

  -- Notify admins
  insert into public.notifications (user_id, title, body, link)
  select
    p.id,
    'Event Resubmitted (v' || v_new_revision::text || ')',
    'An organizer has resubmitted changes for review.',
    '/admin/approvals'
  from public.profiles p
  where p.role = 'admin';

end;
$$;

grant execute on function public.resubmit_event(uuid, jsonb, jsonb, text) to authenticated;
