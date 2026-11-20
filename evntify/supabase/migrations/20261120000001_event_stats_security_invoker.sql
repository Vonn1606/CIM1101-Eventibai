-- Migration: Restrict event_stats VIEW with security_invoker
-- Keeps the exact existing schema (event_id, total_capacity, registered_count, seats_left, waitlist_count, checked_in_count, capacity_label)
-- but adds security_invoker = true so that RLS on events and registrations is respected.
-- Applied: 2026-11-20

drop view if exists public.event_stats;

create view public.event_stats with (security_invoker = true) as
select
  e.id as event_id,
  e.total_capacity,
  count(r.*) filter (where r.status = 'registered')                  as registered_count,
  greatest(e.total_capacity - count(r.*) filter (where r.status = 'registered'), 0) as seats_left,
  count(r.*) filter (where r.status = 'waitlisted')                  as waitlist_count,
  (select count(*) from public.check_ins c where c.event_id = e.id)  as checked_in_count,
  case
    when count(r.*) filter (where r.status = 'registered') >= e.total_capacity then 'FULL'
    when e.total_capacity - count(r.*) filter (where r.status = 'registered') <= 20 then 'LIMITED'
    else 'OPEN'
  end as capacity_label
from public.events e
left join public.registrations r on r.event_id = e.id
group by e.id;

-- Grant permissions to authenticated and service_role
grant select on public.event_stats to authenticated;
grant select on public.event_stats to service_role;
