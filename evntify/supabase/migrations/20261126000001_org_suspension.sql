-- Add is_suspended flag to organizations for admin suspension status (P0-4 / A1)
alter table public.organizations
  add column if not exists is_suspended boolean not null default false;
