-- ============================================================================
-- Phase 1 Data Integrity Migration (I1, I3, F8)
-- ============================================================================

-- 1. F8: Update colleges.short_name to match lib/department.ts
update public.colleges
set short_name = 'Business Administration'
where slug = 'biz';

update public.colleges
set short_name = 'Fine Arts, Architecture, and Design'
where slug = 'art';

-- 2. I1: Back-fill organizations.college_id where null
-- First match dept_label against colleges (name, code, slug, short_name)
update public.organizations o
set college_id = c.id
from public.colleges c
where o.college_id is null
  and o.dept_label is not null
  and (
    lower(trim(o.dept_label)) = lower(c.name)
    or lower(trim(o.dept_label)) = lower(c.code)
    or lower(trim(o.dept_label)) = lower(c.slug)
    or lower(trim(o.dept_label)) = lower(c.short_name)
  );

-- Fallback: match via an existing organization member's profile college_id
update public.organizations o
set college_id = sub.college_id
from (
  select distinct on (om.organization_id)
    om.organization_id,
    p.college_id
  from public.organization_members om
  join public.profiles p on p.id = om.user_id
  where p.college_id is not null
  order by om.organization_id
) sub
where o.id = sub.organization_id
  and o.college_id is null;

-- 3. I3: Ensure deleting a user from auth.users cascades cleanly without FK blocks
-- Make audit/log/history author columns nullable where needed and use ON DELETE SET NULL
alter table public.events
  drop constraint if exists events_created_by_fkey,
  add constraint events_created_by_fkey
    foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.event_approvals
  drop constraint if exists event_approvals_submitted_by_fkey,
  add constraint event_approvals_submitted_by_fkey
    foreign key (submitted_by) references public.profiles(id) on delete set null,
  drop constraint if exists event_approvals_reviewed_by_fkey,
  add constraint event_approvals_reviewed_by_fkey
    foreign key (reviewed_by) references public.profiles(id) on delete set null;

alter table public.check_ins
  drop constraint if exists check_ins_checked_in_by_fkey,
  add constraint check_ins_checked_in_by_fkey
    foreign key (checked_in_by) references public.profiles(id) on delete set null;

alter table public.broadcasts
  alter column sent_by drop not null,
  drop constraint if exists broadcasts_sent_by_fkey,
  add constraint broadcasts_sent_by_fkey
    foreign key (sent_by) references public.profiles(id) on delete set null;

alter table public.admin_notes
  alter column author_id drop not null,
  drop constraint if exists admin_notes_author_id_fkey,
  add constraint admin_notes_author_id_fkey
    foreign key (author_id) references public.profiles(id) on delete set null;

alter table public.audit_logs
  drop constraint if exists audit_logs_actor_id_fkey,
  add constraint audit_logs_actor_id_fkey
    foreign key (actor_id) references public.profiles(id) on delete set null;

alter table public.organizer_applications
  drop constraint if exists organizer_applications_reviewed_by_fkey,
  add constraint organizer_applications_reviewed_by_fkey
    foreign key (reviewed_by) references public.profiles(id) on delete set null;

-- Clean up any orphaned profiles rows whose auth.users row no longer exists
delete from public.profiles p
where not exists (
  select 1 from auth.users u where u.id = p.id
);

-- Make handle_new_user idempotent and resilient to stale orphan profiles
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

  -- Remove any orphaned profile with matching email or student_number whose auth user was deleted
  delete from public.profiles p
  where not exists (select 1 from auth.users u where u.id = p.id)
    and (
      p.email = new.email
      or (
        new.raw_user_meta_data->>'student_number' is not null
        and p.student_number = new.raw_user_meta_data->>'student_number'
      )
    );

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
    email = excluded.email,
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
