-- Migration: RLS policies for organizations and organization_members
-- Allows admin-role users to insert/update/delete via server actions.
-- Applied: 2026-11-20

-- organizations: allow admin insert
drop policy if exists "admin can insert organizations" on public.organizations;
create policy "admin can insert organizations"
  on public.organizations
  for insert
  with check (public.is_admin());

-- organizations: allow admin update
drop policy if exists "admin can update organizations" on public.organizations;
create policy "admin can update organizations"
  on public.organizations
  for update
  using (public.is_admin());

-- organization_members: allow admin all operations
drop policy if exists "admin can manage org members" on public.organization_members;
create policy "admin can manage org members"
  on public.organization_members
  for all
  using (public.is_admin())
  with check (public.is_admin());
