-- ============================================================================
-- Migration: register_for_event rejects suspended events (Item 6)
-- Replaces the 20261107190000 definition, adding 'suspended' to the blocked
-- statuses. Everything else is unchanged.
-- ============================================================================
create or replace function public.register_for_event(p_event uuid, p_student_number text, p_college text)
returns public.registrations as $$
declare
  v_event  public.events;
  v_taken  int;
  v_status public.registration_status;
  v_user   public.profiles;
  v_row    public.registrations;
begin
  -- Validate event exists and is approved & open
  select * into v_event from public.events where id = p_event for update;
  if not found then
    raise exception 'Event not found';
  end if;

  if v_event.approval <> 'approved'
     or v_event.status in ('cancelled', 'completed', 'draft', 'suspended') then
    raise exception 'Registration is not available for this event';
  end if;

  if v_event.registration_deadline is not null and now() > v_event.registration_deadline then
    raise exception 'Registration for this event has closed';
  end if;

  select * into v_user from public.profiles where id = auth.uid();
  if not found then
    raise exception 'User profile not found';
  end if;

  select count(*) into v_taken from public.registrations
    where event_id = p_event and status = 'registered';

  v_status := case when v_taken >= v_event.total_capacity
                   then 'waitlisted'::public.registration_status
                   else 'registered'::public.registration_status end;

  insert into public.registrations (event_id, user_id, ticket_code, full_name, student_number, email, college, status)
  values (
    p_event,
    auth.uid(),
    upper(coalesce(v_event.code, 'EVT')) || '-' || substr(gen_random_uuid()::text, 1, 6),
    v_user.full_name,
    p_student_number,
    v_user.email,
    p_college,
    v_status
  )
  returning * into v_row;

  return v_row;
end;
$$ language plpgsql security definer set search_path = public;
