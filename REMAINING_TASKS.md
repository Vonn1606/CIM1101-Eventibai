# Eventify Migration: Remaining Tasks & Action Plan

This document outlines the remaining tasks to complete 100% of the **Mock Data → Supabase Migration Guide**.

---

## Current Status Overview
- **Build Status**: Passing (`npx tsc --noEmit` and `npm run build` succeed with 0 errors).
- **Core Database Features**: Schema tables (19), SSR cookie auth, role-based middleware guards, public event listings, and basic registration RPC are working.
- **Pending Work**: Connecting real data to remaining UI widgets, wiring the new `/create-event` page, hydrating proposal review modals and headers, removing hardcoded KPI metrics/counts, implementing missing server actions (broadcasts, event updates, suspensions, notes), dynamic QR generation, and deleting legacy mock files.

---

## Phase 2: User Profiles & Navigation Auth

### Task 2.1: Load Colleges Dynamically (/)
- **File**: `evntify/component/login/signup/signupform.tsx` (lines 15–20)
- **Problem**: Previously defined a hardcoded array `const COLLEGES = [...]`.
- **Done When**: Adding a college to the Supabase database automatically appears in the sign-up dropdown without code changes.

### Task 2.2: Unify Real Profile Hydration in Navigation Headers
- **Files**:
  - `evntify/lib/use-auth.ts`
  - `evntify/component/dashboard/events/eventsnavbar.tsx` (lines 17–28)
  - `evntify/component/user-profile/Header.tsx` (lines 24–36)
  - `evntify/component/admin/Header.tsx`
- **Problem**: If `user.user_metadata` is absent or incomplete, navbars fall back to hardcoded dummy profile text: `"Alex Dela Cruz"` and `"STUDENT • CCSS"`.
- **Action**:
  - Update `useAuth()` to load `full_name`, `role`, `department`, and `student_number` from `profiles`.
  - Replace the fallback strings so that the student's real profile name and academic department display in the profile button and dropdown.
- **Done When**: Any signed-in user sees their actual profile name and college/department on all pages.

---

## Phase 3: Registration & Fast-Pass

### Task 3.1: Check Existing Registration on Page Load (/)
- **Files**:
  - `evntify/app/events/[id]/page.tsx`
  - `evntify/app/events/[id]/event-details-client.tsx`
- **Done When**: Refreshing the page as a registered student immediately shows your ticket code and Fast-Pass button.

### Task 3.2: Enforce Registration Deadline (/)
- **File**: `evntify/app/events/[id]/event-details-client.tsx`
- **Done When**: Setting an event deadline in the past makes the Register button disabled with a clear "Registration Closed" label.

### Task 3.3: Replace Fake SVG with Dynamic QR Code
- **Files**:
  - `evntify/package.json`
  - `evntify/app/events/[id]/event-details-client.tsx` (lines 676–710)
  - `evntify/component/user-profile/EventCards.tsx` (Fast-Pass QR view)
- **Problem**: The modal renders a hardcoded static SVG drawing of a QR code that does not encode `ticket_code`.
- **Action**:
  1. Install `qrcode` and its types:
     ```bash
     cd evntify && npm i qrcode && npm i -D @types/qrcode
     ```
  2. Generate a data URL from `ticketCode` using `QRCode.toDataURL(ticketCode)` or use a lightweight SVG QR component.
  3. Render the generated image in the Fast-Pass modal.
- **Done When**: Scanning the QR code with a phone camera reads the student's exact `ticket_code` (e.g. `TYK11-XXXXXXXX`).

---

## Phase 4: Organizer Dashboard & Event Creation

### Task 4.1: Dynamic Event Registry Filter Counts
- **File**: `evntify/app/organizer-dashboard/organizer-dashboard-client.tsx` (lines 727–768)
- **Problem**: Filter pill buttons have hardcoded numbers: `All (3)`, `Active (1)`, `SAO Pending (1)`, and `Archived (2)`.
- **Action**:
  - Compute counts dynamically from `events`:
    ```ts
    const counts = useMemo(() => ({
      all: events.length,
      active: events.filter(e => e.status === "live" || e.status === "soldout").length,
      sao: events.filter(e => e.status === "pending").length,
      archived: events.filter(e => e.status === "archived").length,
    }), [events]);
    ```
  - Display `{counts.all}`, `{counts.active}`, `{counts.sao}`, `{counts.archived}` in the buttons.
- **Done When**: Filter pill counts match the actual number of events in each tab.

### Task 4.2: Replace Hardcoded Organizer KPI Cards
- **Files**:
  - `evntify/lib/db/stats.ts` or `evntify/lib/db/organizer.ts`
  - `evntify/app/organizer-dashboard/organizer-dashboard-client.tsx` (lines 611–689)
- **Problem**:
  - Card 2 hardcodes: `03 venues booked`, `6 operating now`.
  - Card 3 hardcodes: `01 in dean review`, `Est. Turnaround ~4.2 hrs`.
  - Card 4 hardcodes: Reach count and progress.
- **Action**:
  - Return KPI counts from `getOrgEvents()` or `lib/db/stats.ts`:
    - Live operating events count.
    - Pending approval count (`approval = 'pending'`).
    - Distinct venues booked.
  - Pass these metrics into `OrganizerDashboardClient`.
- **Done When**: Submitting a new event increments the pending count on the KPI card.

### Task 4.3: Implement `updateEvent()` Server Action
- **File**: `evntify/app/actions/events.ts`
- **Action**:
  - Add `updateEvent(eventId: string, data: UpdateEventInput)`:
    - Validate with Zod.
    - Verify user belongs to the event's organization or is an admin.
    - Update the `events` table row.
    - `revalidatePath('/organizer-dashboard')` and `revalidatePath('/events')`.
- **Done When**: Editing event details from the organizer dashboard saves changes to the database.

### Task 4.4: Wire Broadcasts Action & Delivery Logs
- **Files**:
  - Create `evntify/app/actions/broadcasts.ts`
  - `evntify/app/organizer-dashboard/organizer-dashboard-client.tsx` (lines 251–262, 1590–1650)
- **Problem**:
  - Clicking "Broadcast Now" only displays a toast message: `🚀 Broadcast sent to 2,940 students...`.
  - Broadcast delivery logs modal displays static dummy rows.
- **Action**:
  1. In `app/actions/broadcasts.ts`, create `sendBroadcast({ eventId, message, channels })`:
     - Validate `message.length <= 240`.
     - Insert a row into the `broadcasts` table (`sender_id`, `event_id`, `message`, `channels`).
     - Query attendees registered for the event and insert rows into `notifications` and `broadcast_deliveries`.
  2. Wire the composer form in `organizer-dashboard-client.tsx` to `sendBroadcast`.
  3. Load actual delivery logs from `broadcasts` and `broadcast_deliveries` inside the modal.
- **Done When**: Broadcasting a message creates real notification rows in the database for registered attendees.

### Task 4.5: Wire `/create-event` Form to Supabase Server Action & Dynamic Data
- **Files**:
  - `evntify/app/organizer-dashboard/create-event/page.tsx`
  - `evntify/component/organizer/create-event-form.tsx`
  - `evntify/app/actions/events.ts`
- **Problem**:
  - Submit handler contains `// TODO: wire to Supabase insert` and only shows browser `alert()`.
  - Organization, Department, and Venue dropdowns are hardcoded arrays.
  - Capacity calculation uses hardcoded constant `CAPACITY_MAX = 300`.
- **Action**:
  1. Load dynamic `venues`, `colleges`, and organizer `organizations` on `page.tsx` and pass as props to `CreateEventForm`.
  2. Expand `submitEvent` action in `app/actions/events.ts` to handle category, dates, venue, and descriptions.
  3. Wire form submission to call `submitEvent()`, insert into `events` and `event_approvals`, and redirect with feedback.
- **Done When**: Submitting the form creates a real row in `events` and `event_approvals` visible on both the organizer dashboard and the admin approval queue.

---

## Phase 5: Admin Portal

### Task 5.1: Real Clearance Rate & Review Time Calculation
- **File**: `evntify/component/admin/ApApprovalsView.tsx` (lines 23–25, 200–240)
- **Problem**: Clearance rate is hardcoded as `const RATE = 92;` and review turnaround time is hardcoded as `~4.2 hrs`.
- **Action**:
  - In `lib/db/stats.ts`, compute:
    - Clearance rate: `(approved / (approved + rejected)) * 100`.
    - Average turnaround: average diff between `decided_at` and `submitted_at`.
  - Pass these values into `ApApprovalsView`.
- **Done When**: Approving or rejecting a proposal adjusts the live clearance percentage.

### Task 5.2: Inspector Drawer (Facilities, Notes, Suspension)
- **Files**:
  - `evntify/component/admin/EdInspector.tsx`
  - `evntify/component/admin/EdEventsView.tsx`
  - `evntify/app/actions/events.ts` (or `app/actions/admin.ts`)
- **Problem**:
  - Facilities display dummy placeholder values `["—", "—", "—", "—"]`.
  - Supervisory notes are stored only in React state and never persisted to `admin_notes`.
  - The "Suspend" button has no action attached.
- **Action**:
  1. Query `event_facilities` for the selected event and show active facilities.
  2. Add `saveAdminNote(eventId: string, note: string)` Server Action that inserts into `admin_notes`.
  3. Add `suspendEvent(eventId: string, reason: string)` Server Action:
     - Sets `events.status = 'suspended'`.
     - Inserts an entry into `audit_logs` (`action = 'event_suspended'`).
     - Revalidates `/admin/events-directory` and `/events`.
- **Done When**: Clicking Suspend changes the event status in the database and reflects immediately on the UI.

### Task 5.3: Hydrate Proposal Review Modal & Implement "Return for Edits" Action
- **Files**:
  - `evntify/component/admin/ApReviewModal.tsx`
  - `evntify/component/admin/ApApprovalsView.tsx`
  - `evntify/lib/db/stats.ts` (`getApprovals()`)
  - `evntify/app/actions/approvals.ts`
- **Problem**:
  - `ApReviewModal` shows empty or dummy values for dates, venue note, attendance percentage, and contacts.
  - "Return for edits" button only updates client React state without persisting to Supabase.
- **Action**:
  1. In `lib/db/stats.ts`, expand `getApprovals()` to select event schedule, venue notes, organizer contacts, and safety notes.
  2. Update `decideApproval` in `app/actions/approvals.ts` to support `"returned"` status, updating `event_approvals.decision = 'returned'` and notifying the organizer.
  3. Wire the "Return for edits" button in `ApApprovalsView` to invoke `decideApproval`.
- **Done When**: Clicking "Return for edits" updates the database record and shows the proposal in the "Returned for edits" tab.

---

## Phase 6: Final Cleanup & Hardcoded String Removal

### Task 6.1: Delete Legacy Mock Files & Redundant Admin DB File
- **Files to remove**:
  - `evntify/lib/db/admin.ts` (redundant duplicate of `lib/db/stats.ts`)
  - `evntify/app/data/proposals.ts`
  - `evntify/app/data/events-directory.ts`
  - `evntify/app/data/events.ts`
- **Dependencies to migrate first**:
  - Move UI type definitions (`Proposal`, `EventItem`, `Decision`, `EventCard`) to `evntify/types/` or `evntify/lib/db/stats.ts`.
  - Move `pct()` helper from `events-directory.ts` into a utility file (e.g. `lib/utils.ts` or `lib/events.ts`).
  - Update `marqueeRows` in `component/landingpage/showcase.tsx` to read from upcoming campus events or a dedicated landing content config.
  - Delete `app/data/`.
- **Done When**: The `app/data` folder and `lib/db/admin.ts` are removed and `npm run build` succeeds.

### Task 6.2: Remove Hardcoded Fallback Texts
- **File**: `evntify/app/events/[id]/event-details-client.tsx` (lines 323–331)
- **Problem**: Still contains hardcoded fallback description:
  `"The LITS Arena: Figma Showdown 2026 gathers aspiring campus product designers..."`.
- **Action**: Replace with a clean generic empty state or prompt (e.g. `"No event description provided by organizer."`).

### Task 6.3: Remove Redundant Root `package-lock.json`
- **File**: `c:\Users\Vonn\CIM1101---Project\package-lock.json`
- **Problem**: An empty lockfile in the parent directory causes Next.js Turbopack to show a workspace root inference warning on every build.
- **Action**:
  ```bash
  rm package-lock.json
  ```
- **Done When**: Running `npm run build` inside `evntify` outputs no workspace root warning.
