-- Migration: Add authenticated read policy for organization_members and RPC for member counts

drop policy if exists "authenticated read organization_members" on public.organization_members;
create policy "authenticated read organization_members"
  on public.organization_members
  for select
  using (auth.role() = 'authenticated');

create or replace function public.get_organization_member_counts(p_org_ids uuid[])
returns table(organization_id uuid, member_count bigint)
language sql
security definer
stable
as $$
  select organization_id, count(*)::bigint as member_count
  from public.organization_members
  where organization_id = any(p_org_ids)
  group by organization_id;
$$;

grant execute on function public.get_organization_member_counts(uuid[]) to authenticated, anon;
