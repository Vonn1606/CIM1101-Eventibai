-- Migration: Fix re-registration after cancellation and waitlist promotion on cancellation (H2, H3)
-- Applied: 2026-11-22

-- 1. Function to promote the next waitlisted student when a seat is freed
create or replace function public.promote_next_waitlisted(p_event uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_next_reg public.registrations;
  v_event_title text;
begin
  select * into v_next_reg
  from public.registrations
  where event_id = p_event and status = 'waitlisted'
  order by registered_at asc
  limit 1
  for update skip locked;

  if found then
    update public.registrations
    set status = 'registered'
    where id = v_next_reg.id;

    select title into v_event_title from public.events where id = p_event;

    -- Notify the student that they have been promoted from waitlist to confirmed seat
    insert into public.notifications (user_id, title, message, link)
    values (
      v_next_reg.user_id,
      'Waitlist Confirmed!',
      'Great news! A seat opened up for "' || coalesce(v_event_title, 'an event') || '" and your registration has been confirmed.',
      '/my-events'
    );

    return v_next_reg.id;
  end if;

  return null;
end;
$$;

-- 2. Update register_for_event to support re-registering if user previously cancelled
create or replace function public.register_for_event(p_event uuid, p_student_number text, p_college text)
returns public.registrations as $$
declare
  v_event  public.events;
  v_taken  int;
  v_status public.registration_status;
  v_user   public.profiles;
  v_row    public.registrations;
  v_existing public.registrations;
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

  -- Check existing registration
  select * into v_existing from public.registrations
    where event_id = p_event and user_id = auth.uid();

  if found and v_existing.status in ('registered', 'waitlisted') then
    raise exception 'You are already registered for this event';
  end if;

  select count(*) into v_taken from public.registrations
    where event_id = p_event and status = 'registered';

  v_status := case when v_taken >= v_event.total_capacity
                   then 'waitlisted'::public.registration_status
                   else 'registered'::public.registration_status end;

  if found and v_existing.status = 'cancelled' then
    -- Reactivate cancelled registration with a fresh ticket code and timestamp
    update public.registrations
    set status = v_status,
        ticket_code = upper(coalesce(v_event.code, 'EVT')) || '-' || substr(gen_random_uuid()::text, 1, 6),
        registered_at = now(),
        student_number = p_student_number,
        college = p_college,
        full_name = v_user.full_name,
        email = v_user.email
    where id = v_existing.id
    returning * into v_row;
  else
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
  end if;

  return v_row;
end;
$$ language plpgsql security definer set search_path = public;
