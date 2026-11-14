-- Migration: Create organizer_applications table and allow students to apply + admins to review
create type application_status as enum ('pending', 'approved', 'rejected');

create table if not exists public.organizer_applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  org_name        text not null,
  position        text not null,
  department      text,
  reason          text not null,
  status          application_status not null default 'pending',
  admin_notes     text,
  created_at      timestamptz not null default now(),
  reviewed_at     timestamptz,
  reviewed_by     uuid references public.profiles(id)
);

-- Index for status and user
create index if not exists idx_organizer_apps_user on public.organizer_applications(user_id);
create index if not exists idx_organizer_apps_status on public.organizer_applications(status);

-- Enable RLS
alter table public.organizer_applications enable row level security;

-- Policies
create policy "Users can view their own applications"
  on public.organizer_applications for select
  using (user_id = auth.uid() or public.current_role_is('admin'));

create policy "Users can submit applications"
  on public.organizer_applications for insert
  with check (user_id = auth.uid());

create policy "Admins can update applications"
  on public.organizer_applications for update
  using (public.current_role_is('admin'))
  with check (public.current_role_is('admin'));

create policy "Admins can delete applications"
  on public.organizer_applications for delete
  using (public.current_role_is('admin'));
