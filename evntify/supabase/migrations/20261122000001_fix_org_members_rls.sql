-- Migration: Fix organization_members RLS so authenticated users can read their own rows
-- This fixes "permission denied for table organization_members" on create-event page.
--
-- Root cause: the broad "read organization_members" policy (auth.role() = 'authenticated')
-- may not be active on the live DB. We replace it with a scoped self-read policy PLUS
-- an admin-read-all policy, which is more secure and ensures organizers see their own membership.

-- Drop any conflicting existing policies
drop policy if exists "read organization_members"           on public.organization_members;
drop policy if exists "admin manages organization_members"  on public.organization_members;
drop policy if exists "admin can manage org members"        on public.organization_members;

-- Users can read their own membership rows
create policy "members can read own rows"
  on public.organization_members
  for select
  using (user_id = auth.uid());

-- Admins can read all membership rows
create policy "admin can read all org members"
  on public.organization_members
  for select
  using (public.is_admin());

-- Admins can insert/update/delete any membership row
create policy "admin can write org members"
  on public.organization_members
  for all
  using (public.is_admin())
  with check (public.is_admin());
