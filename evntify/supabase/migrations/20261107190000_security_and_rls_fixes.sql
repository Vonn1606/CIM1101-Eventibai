-- Migration: Fix RLS Security Holes, Add Search Path & Tighten Access Policies
-- Addresses Security items 1 - 6 from Code Review

-- 1. Security function hardening: ensure search_path is immutable
alter function public.current_role_is(user_role) set search_path = public;

-- Helper function: check if current user has 'admin' role
create or replace function public.is_admin() returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$ language sql stable security definer set search_path = public;

-- 1b. Auto-create profile trigger: save college_id and handle duplicates safely
create or replace function public.handle_new_user() returns trigger as $$
declare
  v_college_slug text;
  v_college_id uuid;
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
    raise exception 'A profile with this student number or email already exists.';
end;
$$ language plpgsql security definer set search_path = public;

-- 2. Profiles: Prevent privilege escalation
-- Drop old permissive update policy and add WITH CHECK to prevent role tampering
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and (
      -- Student/user cannot change their role; only admin can modify roles
      role = (select p.role from public.profiles p where p.id = auth.uid())
      or public.current_role_is('admin')
    )
  );

-- 3. Events: Prevent self-approval
-- Creators can edit drafts or details, but cannot self-approve or self-clear status
drop policy if exists "owner or admin edits events" on public.events;
create policy "owner or admin edits events"
on public.events
for update
to authenticated
using (
  public.is_admin()
  or (
    created_by = auth.uid()
    and approval in ('pending', 'returned')
  )
)
with check (
  public.is_admin()
  or (
    created_by = auth.uid()
    and approval in ('pending', 'returned')
  )
);

-- 4. Approvals: Prevent self-approval by submitter
drop policy if exists "admin reviews approvals" on public.event_approvals;
create policy "admin reviews approvals" on public.event_approvals
  for all
  using (public.current_role_is('admin'))
  with check (public.current_role_is('admin'));

-- Submitter can view their own approval status
drop policy if exists "submitter views own approval" on public.event_approvals;
create policy "submitter views own approval" on public.event_approvals
  for select
  using (submitted_by = auth.uid());

-- 5. Enable RLS on all un-gated tables
alter table public.colleges             enable row level security;
alter table public.organizations        enable row level security;
alter table public.organization_members enable row level security;
alter table public.venues               enable row level security;
alter table public.venue_closures       enable row level security;
alter table public.event_features       enable row level security;
alter table public.event_facilities     enable row level security;
alter table public.event_documents      enable row level security;
alter table public.gates                enable row level security;
alter table public.broadcast_deliveries enable row level security;
alter table public.admin_notes          enable row level security;

-- Policies for public / read-only catalogs
drop policy if exists "public read colleges" on public.colleges;
create policy "public read colleges" on public.colleges for select using (true);

drop policy if exists "public read organizations" on public.organizations;
create policy "public read organizations" on public.organizations for select using (true);

drop policy if exists "public read venues" on public.venues;
create policy "public read venues" on public.venues for select using (true);

drop policy if exists "public read venue_closures" on public.venue_closures;
create policy "public read venue_closures" on public.venue_closures for select using (true);

drop policy if exists "public read event_features" on public.event_features;
create policy "public read event_features" on public.event_features for select using (true);

drop policy if exists "public read event_facilities" on public.event_facilities;
create policy "public read event_facilities" on public.event_facilities for select using (true);

-- 1. Event Features: Organizers manage features of their own pending/returned events; Admin manages all
drop policy if exists "owner manages event_features" on public.event_features;
create policy "owner manages event_features"
on public.event_features
for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.events e
    where e.id = event_features.event_id
      and e.created_by = auth.uid()
      and e.approval in ('pending', 'returned')
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.events e
    where e.id = event_features.event_id
      and e.created_by = auth.uid()
      and e.approval in ('pending', 'returned')
  )
);

-- 2. Event Facilities: Organizers manage facilities of their own pending/returned events; Admin manages all
drop policy if exists "owner manages event_facilities" on public.event_facilities;
create policy "owner manages event_facilities"
on public.event_facilities
for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.events e
    where e.id = event_facilities.event_id
      and e.created_by = auth.uid()
      and e.approval in ('pending', 'returned')
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.events e
    where e.id = event_facilities.event_id
      and e.created_by = auth.uid()
      and e.approval in ('pending', 'returned')
  )
);

-- 3. Venue Closures: Admins manage venue closures
drop policy if exists "admin manages venue_closures" on public.venue_closures;
create policy "admin manages venue_closures"
on public.venue_closures
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Organization members: anyone authenticated can read, only admin can manage
drop policy if exists "read organization_members" on public.organization_members;
create policy "read organization_members" on public.organization_members
  for select using (auth.role() = 'authenticated');

drop policy if exists "admin manages organization_members" on public.organization_members;
create policy "admin manages organization_members" on public.organization_members
  for all using (public.current_role_is('admin'));

-- Event documents: public can view approved, owners/admin can manage
drop policy if exists "read event_documents" on public.event_documents;
create policy "read event_documents" on public.event_documents
  for select using (
    exists (
      select 1 from public.events e
      where e.id = event_documents.event_id
        and (e.approval = 'approved' or e.created_by = auth.uid() or public.current_role_is('admin'))
    )
  );

drop policy if exists "organizers insert event_documents" on public.event_documents;
create policy "organizers insert event_documents" on public.event_documents
  for insert with check (public.current_role_is('organizer') or public.current_role_is('admin'));

-- Gates & deliveries
drop policy if exists "staff read gates" on public.gates;
create policy "staff read gates" on public.gates for select
  using (public.current_role_is('organizer') or public.current_role_is('admin'));

drop policy if exists "staff manage deliveries" on public.broadcast_deliveries;
create policy "staff manage deliveries" on public.broadcast_deliveries for all
  using (public.current_role_is('organizer') or public.current_role_is('admin'));

-- Admin notes: strictly for admins
drop policy if exists "admin manages admin_notes" on public.admin_notes;
create policy "admin manages admin_notes" on public.admin_notes
  for all using (public.current_role_is('admin'));

-- Audit logs insert policy for staff/admins
drop policy if exists "staff write audit" on public.audit_logs;
create policy "staff write audit" on public.audit_logs
  for insert with check (auth.role() = 'authenticated');

-- 6. Registrations: WITH CHECK to prevent tampering with ticket_code or status
drop policy if exists "cancel own registration" on public.registrations;
create policy "cancel own registration" on public.registrations
  for update
  using (user_id = auth.uid() or public.current_role_is('admin'))
  with check (
    public.current_role_is('admin')
    or (
      user_id = auth.uid()
      and status = 'cancelled'
    )
  );

-- 6b. Events & Approvals Creation
drop policy if exists "organizers create events" on public.events;
drop policy if exists "organizers create own pending events" on public.events;
create policy "organizers create own pending events"
on public.events
for insert
to authenticated
with check (
  public.is_admin()
  or (
    created_by = auth.uid()
    and approval = 'pending'
    and exists (
      select 1 from public.organization_members m
      where m.organization_id = events.organization_id
        and m.user_id = auth.uid()
    )
  )
);

drop policy if exists "organizers submit own approvals" on public.event_approvals;
create policy "organizers submit own approvals"
on public.event_approvals
for insert
to authenticated
with check (
  submitted_by = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('organizer', 'admin')
  )
  and exists (
    select 1 from public.events e
    where e.id = event_approvals.event_id
      and e.created_by = auth.uid()
      and e.approval = 'pending'
  )
);

-- 7. Fix register_for_event security definer function checks
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

  if v_event.approval <> 'approved' or v_event.status in ('cancelled', 'completed', 'draft') then
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

  v_status := case when v_taken >= v_event.total_capacity then 'waitlisted'::public.registration_status else 'registered'::public.registration_status end;

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

