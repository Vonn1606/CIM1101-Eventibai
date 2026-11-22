-- Migration: Additional performance indexes for Eventify
-- Target: Compound filters and high-traffic foreign keys
-- Date: 2026-11-23

-- 1. Compound index on events for directory, admin kpis, and calendar
create index if not exists idx_events_approval_status_starts_at
  on public.events (approval, status, starts_at);

-- 2. Index on registrations for count rollups and status checks
create index if not exists idx_registrations_event_id_status
  on public.registrations (event_id, status);

-- 3. Approvals queue sorting and decision filtering
create index if not exists idx_event_approvals_decision_submitted_at
  on public.event_approvals (decision, submitted_at desc);

-- 4. Events by organization lookup
create index if not exists idx_events_organization_id
  on public.events (organization_id);
