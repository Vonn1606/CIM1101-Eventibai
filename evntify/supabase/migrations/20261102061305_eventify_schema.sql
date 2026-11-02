-- ============================================================================
-- Eventify database schema (Supabase / PostgreSQL)
-- Derived from: landing, /events, /events/[id], /my-events, /organizer-dashboard,
-- /admin (dashboard, events-directory, approvals, user-and-organizer)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- Enums -----------------------------------------------------------
create type user_role           as enum ('student', 'organizer', 'admin');
create type approval_status     as enum ('pending', 'returned', 'approved', 'declined');
create type event_status        as enum ('draft', 'scheduled', 'open', 'ongoing', 'completed', 'cancelled', 'suspended');
create type access_tier         as enum ('free_rsvp', 'tiered_rsvp', 'ticketed', 'vip_only');
create type registration_status as enum ('registered', 'waitlisted', 'cancelled');
create type checkin_method      as enum ('qr', 'nfc', 'manual');
create type risk_level          as enum ('low', 'standard', 'high', 'off_campus');
create type doc_kind            as enum ('document', 'endorsement');
create type broadcast_channel   as enum ('push', 'sms', 'discord');
create type delivery_status     as enum ('queued', 'delivered', 'failed');

-- ---------- Shared trigger --------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

-- ---------- 1. Colleges (lib/department.ts, organizer.ts, signup dropdown) --
create table colleges (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,          -- eng, cs, biz, arts, med, law
  code       text unique,                   -- COE, CAS, CBA, FAAD ...
  name       text not null,                 -- "Lucio Tan College of Computer Studies"
  short_name text not null                  -- "Computer Studies"
);

-- ---------- 2. Profiles (1:1 with auth.users) -------------------------------
create table profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text not null,
  email          text not null unique,
  student_number text unique,               -- "2022-84928-MN"
  college_id     uuid references colleges(id),
  department     text,                      -- "Information Technology"
  year_program   text,                      -- "BSIT • 3rd Year"
  phone          text,
  role           user_role not null default 'student',
  is_online      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile when someone signs up via supabase.auth.signUp
create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, full_name, email, student_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'student_number'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- 3. Organizations & membership -----------------------------------
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,                -- "League of Information Technology Students"
  short_name  text,                         -- "LITS"
  initials    text,                         -- badge text
  college_id  uuid references colleges(id),
  dept_label  text,                         -- orgDept
  est_year    int,                          -- "EST. '98"
  created_at  timestamptz not null default now()
);

create table organization_members (
  organization_id uuid references organizations(id) on delete cascade,
  user_id         uuid references profiles(id) on delete cascade,
  position        text not null default 'Member',   -- President, Treasurer, Lead ...
  primary key (organization_id, user_id)
);

-- ---------- 4. Venues --------------------------------------------------------
create table venues (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,                   -- "TYK Auditorium"
  details  text,                            -- "Tan Yan Kee Academic Building, 5th Floor"
  capacity int  not null check (capacity > 0)
);

create table venue_closures (                -- "Hall B closed Dec 20 to 22"
  id        uuid primary key default gen_random_uuid(),
  venue_id  uuid not null references venues(id) on delete cascade,
  reason    text not null,
  starts_on date not null,
  ends_on   date not null,
  check (ends_on >= starts_on)
);

-- ---------- 5. Events --------------------------------------------------------
create table events (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null,     -- used in /events/[id]
  code                  text,                     -- "TYK•11", "LITS-FIGMA-2026-CLR2"
  title                 text not null,
  summary               text,
  description           text[] not null default '{}',  -- paragraphs
  category              text,                     -- "Academic & Design Hackathon"
  tag                   text,                     -- "Hackathon", "Pageant"
  organization_id       uuid not null references organizations(id),
  college_id            uuid references colleges(id),
  venue_id              uuid references venues(id),
  created_by            uuid references profiles(id),
  starts_at             timestamptz not null,
  ends_at               timestamptz,
  doors_open_note       text,
  registration_deadline timestamptz,
  total_capacity        int not null check (total_capacity > 0),
  tier                  access_tier not null default 'free_rsvp',
  banner_color          text default '#6c0c28',
  banner_url            text,
  status                event_status not null default 'draft',
  approval              approval_status not null default 'pending',
  is_featured           boolean not null default false,
  featured_rank         int,
  -- coordinator shown on event details page
  coordinator_name      text,
  coordinator_role      text,
  coordinator_email     text,
  coordinator_phone     text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index on events (starts_at);
create index on events (college_id);
create index on events (organization_id);
create index on events (status, approval);
create trigger trg_events_updated before update on events
  for each row execute function set_updated_at();

create table event_features (               -- the 3 feature boxes
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  title      text not null,
  body       text not null,
  icon_type  text not null default 'maroon' check (icon_type in ('maroon','green','amber')),
  sort_order int  not null default 0
);

create table event_facilities (             -- admin inspector: Power, Wi-Fi, Marshals...
  id       uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  label    text not null,                 -- "Power"
  value    text not null                  -- "2 generators"
);

-- ---------- 6. Approvals (SAO) ----------------------------------------------
create table event_approvals (              -- one row per submission / review cycle
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references events(id) on delete cascade,
  submitted_by     uuid references profiles(id),
  stage            text,                    -- "Awaiting Review", "Needs Attention"
  risk             risk_level not null default 'standard',
  seats_expected   int,
  brief            text,                    -- memo / pitch
  capacity_note    text,
  safety_check     text,                    -- "Fire clearance pending"
  decision         approval_status not null default 'pending',
  decision_note    text,
  reviewed_by      uuid references profiles(id),
  submitted_at     timestamptz not null default now(),
  decided_at       timestamptz
);
create index on event_approvals (decision);

create table event_documents (              -- attached docs + endorsements
  id          uuid primary key default gen_random_uuid(),
  approval_id uuid references event_approvals(id) on delete cascade,
  event_id    uuid not null references events(id) on delete cascade,
  kind        doc_kind not null default 'document',
  label       text not null,              -- "Faculty adviser endorsement"
  file_url    text,
  uploaded_at timestamptz not null default now()
);

-- ---------- 7. Registrations & check-in -------------------------------------
create table registrations (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references events(id) on delete cascade,
  user_id        uuid not null references profiles(id) on delete cascade,
  ticket_code    text unique not null,      -- "LITS-FIGMA-4821" (encode in QR)
  full_name      text not null,
  student_number text not null,
  email          text not null,
  college        text,
  status         registration_status not null default 'registered',
  waitlist_pos   int,
  registered_at  timestamptz not null default now(),
  unique (event_id, user_id)
);
create index on registrations (event_id, status);
create index on registrations (user_id);

create table gates (                         -- "Gate Beacon A-8"
  id       uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id),
  name     text not null,
  is_online boolean not null default true
);

create table check_ins (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references registrations(id) on delete cascade,
  event_id        uuid not null references events(id) on delete cascade,
  method          checkin_method not null default 'qr',
  gate_id         uuid references gates(id),
  checked_in_by   uuid references profiles(id),
  checked_in_at   timestamptz not null default now()
);
create index on check_ins (event_id);

-- ---------- 8. Broadcasts & notifications -----------------------------------
create table broadcasts (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid references events(id) on delete set null,
  sent_by         uuid not null references profiles(id),
  cohort_label    text not null,            -- "All Registered Students (1,140)"
  message         text not null check (char_length(message) <= 240),
  channels        broadcast_channel[] not null default '{push}',
  recipient_count int not null default 0,
  sent_at         timestamptz not null default now()
);

create table broadcast_deliveries (
  id           uuid primary key default gen_random_uuid(),
  broadcast_id uuid not null references broadcasts(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  channel      broadcast_channel not null,
  status       delivery_status not null default 'queued',
  delivered_at timestamptz
);
create index on broadcast_deliveries (broadcast_id, status);

create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  title      text not null,
  body       text,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index on notifications (user_id, read_at);

-- ---------- 9. Admin tooling -------------------------------------------------
create table admin_notes (                   -- "Supervisory Field Notes"
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  author_id  uuid not null references profiles(id),
  note       text not null,
  created_at timestamptz not null default now()
);

create table audit_logs (                    -- "Audit trail is kept for every change"
  id         bigint generated always as identity primary key,
  actor_id   uuid references profiles(id),
  action     text not null,                  -- 'event.suspend', 'proposal.approve' ...
  entity     text not null,
  entity_id  uuid,
  meta       jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Derived data: live counts (replaces hard-coded numbers) ---------
create view event_stats as
select
  e.id as event_id,
  e.total_capacity,
  count(r.*) filter (where r.status = 'registered')                  as registered_count,
  greatest(e.total_capacity - count(r.*) filter (where r.status = 'registered'), 0) as seats_left,
  count(r.*) filter (where r.status = 'waitlisted')                  as waitlist_count,
  (select count(*) from check_ins c where c.event_id = e.id)         as checked_in_count,
  case
    when count(r.*) filter (where r.status = 'registered') >= e.total_capacity then 'FULL'
    when e.total_capacity - count(r.*) filter (where r.status = 'registered') <= 20 then 'LIMITED'
    else 'OPEN'
  end as capacity_label
from events e
left join registrations r on r.event_id = e.id
group by e.id;

-- ---------- Atomic registration (prevents overbooking) ----------------------
create or replace function register_for_event(p_event uuid, p_student_number text, p_college text)
returns registrations as $$
declare
  v_event  events;
  v_taken  int;
  v_status registration_status;
  v_user   profiles;
  v_row    registrations;
begin
  select * into v_event from events where id = p_event for update;
  select * into v_user  from profiles where id = auth.uid();
  select count(*) into v_taken from registrations
    where event_id = p_event and status = 'registered';
  v_status := case when v_taken >= v_event.total_capacity then 'waitlisted' else 'registered' end;

  insert into registrations (event_id, user_id, ticket_code, full_name, student_number, email, college, status)
  values (p_event, auth.uid(),
          upper(coalesce(v_event.code, 'EVT')) || '-' || substr(gen_random_uuid()::text, 1, 6),
          v_user.full_name, p_student_number, v_user.email, p_college, v_status)
  returning * into v_row;
  return v_row;
end;
$$ language plpgsql security definer;

-- ---------- Row Level Security (starter policies) ---------------------------
create or replace function current_role_is(r user_role) returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = r);
$$ language sql stable security definer;

alter table profiles       enable row level security;
alter table events         enable row level security;
alter table registrations  enable row level security;
alter table check_ins      enable row level security;
alter table broadcasts     enable row level security;
alter table notifications  enable row level security;
alter table event_approvals enable row level security;
alter table audit_logs     enable row level security;

create policy "own profile"        on profiles for select using (id = auth.uid() or current_role_is('admin') or current_role_is('organizer'));
create policy "update own profile" on profiles for update using (id = auth.uid());

create policy "public sees approved events" on events for select
  using (approval = 'approved' and status <> 'draft'
         or created_by = auth.uid() or current_role_is('admin'));
create policy "organizers create events" on events for insert
  with check (current_role_is('organizer') or current_role_is('admin'));
create policy "owner or admin edits events" on events for update
  using (created_by = auth.uid() or current_role_is('admin'));

create policy "see own registrations" on registrations for select
  using (user_id = auth.uid() or current_role_is('organizer') or current_role_is('admin'));
create policy "cancel own registration" on registrations for update using (user_id = auth.uid());

create policy "staff manage check-ins" on check_ins for all
  using (current_role_is('organizer') or current_role_is('admin'));

create policy "staff send broadcasts" on broadcasts for all
  using (current_role_is('organizer') or current_role_is('admin'));

create policy "own notifications" on notifications for all using (user_id = auth.uid());

create policy "admin reviews approvals" on event_approvals for all
  using (current_role_is('admin') or submitted_by = auth.uid());

create policy "admin reads audit" on audit_logs for select using (current_role_is('admin'));

-- Seed the 4 colleges
insert into colleges (slug, code, name, short_name) values
  ('eng', 'COE',  'College of Engineering', 'Engineering'),
  ('sci', 'CAS',  'College of Art and Science', 'Arts & Science'),
  ('biz', 'CBA',  'College of Business Administration', 'Business'),
  ('art', 'CFAD', 'College of Fine Arts, Architecture and Design', 'Design');
