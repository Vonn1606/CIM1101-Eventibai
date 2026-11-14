-- ============================================================================
-- Migration: Profile email domain constraint & unique error reporting
-- ============================================================================

-- 1. Ensure email domain constraint on profiles table
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_email_ue_domain'
  ) then
    alter table public.profiles
      add constraint profiles_email_ue_domain check (email like '%@ue.edu.ph');
  end if;
end $$;

-- 2. Enhanced handle_new_user with specific unique constraint error messaging
create or replace function public.handle_new_user() returns trigger as $$
declare
  v_college_slug text;
  v_college_id uuid;
  v_err_detail text;
  v_err_constraint text;
begin
  v_college_slug := new.raw_user_meta_data->>'college';
  if v_college_slug is not null then
    select id into v_college_id from public.colleges where slug = v_college_slug limit 1;
  end if;

  insert into public.profiles (id, full_name, email, student_number, college_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'student_number',
    v_college_id
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    student_number = coalesce(excluded.student_number, profiles.student_number),
    college_id = coalesce(excluded.college_id, profiles.college_id);

  return new;
exception
  when unique_violation then
    get stacked diagnostics
      v_err_detail = pg_exception_detail,
      v_err_constraint = constraint_name;

    if v_err_constraint = 'profiles_student_number_key' or v_err_detail ilike '%student_number%' then
      raise exception 'This student number is already registered.';
    elsif v_err_constraint = 'profiles_email_key' or v_err_detail ilike '%email%' then
      raise exception 'This email address is already registered.';
    else
      raise exception 'A profile with this student number or email already exists.';
    end if;
end;
$$ language plpgsql security definer set search_path = public;

