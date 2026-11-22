-- Migration: Add missing performance indexes for Eventify
-- Target: Foreign keys, status filters, and compound sort keys
-- Date: 2026-11-22

-- 1. Organization members lookup (queried on every dashboard and role check)
create index if not exists idx_org_members_user_id
  on public.organization_members (user_id);

create index if not exists idx_org_members_org_id
  on public.organization_members (organization_id);

-- 2. Events compound filtering and sorting (Home, Events Directory, and Calendar)
create index if not exists idx_events_approval_starts_at
  on public.events (approval, starts_at);

create index if not exists idx_events_featured
  on public.events (is_featured, approval, featured_rank)
  where is_featured = true;

create index if not exists idx_events_created_by
  on public.events (created_by);

-- 3. Check-ins join index
create index if not exists idx_check_ins_registration_id
  on public.check_ins (registration_id);

-- 4. Admin notes foreign key
create index if not exists idx_admin_notes_event_id
  on public.admin_notes (event_id);

-- 5. Profiles role filter
create index if not exists idx_profiles_role
  on public.profiles (role);

-- 6. Event facilities and documents foreign keys
create index if not exists idx_event_facilities_event_id
  on public.event_facilities (event_id);

create index if not exists idx_event_documents_event_id
  on public.event_documents (event_id);
