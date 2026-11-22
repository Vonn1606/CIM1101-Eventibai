# Implementation Plan: Organizer Dashboard & Query Optimization

## Problem Summary
The Organizer features (particularly `/organizer-dashboard` and `lib/db/organizer.ts`) suffer from high latency, database stalls, and redundant network round-trips caused by:
1. **Slow View Evaluation in `getOrgEvents`:** Queries `event_stats` (a PostgreSQL view with `security_invoker = true`), which runs recursive RLS checks (`user_owns_event` and `is_admin`) and a correlated check-ins subquery across all system events just to fetch registration and waitlist counts for up to 20 events.
2. **5x Redundant `getUser()` Auth Round-trips:** In a single page load of `/organizer-dashboard`, external HTTPS calls to Supabase Auth (`/auth/v1/user`) are made 5 separate times (`proxy.ts`, `page.tsx`, `getOrgProfile()`, `getOrgEvents()`, and `getOrgRoster()`).
3. **3x Duplicate `organization_members` Lookups:** The organizer's `organization_id` is queried independently three times in parallel for the exact same user.
4. **Sequential Dependencies in `getOrgRoster`:** On initial page load, `getOrgRoster` makes 2 sequential database queries to re-find the org ID and latest event ID (even though `getOrgEvents` already has them), followed by joining `events(category)` across 100 registration rows when the category is already known.
5. **Memory-Heavy Counting in `getOrganizers`:** In `lib/db/stats.ts:getOrganizers()`, raw rows for all pending approvals and active events across all organizations are downloaded over the network to count them in Node.js via `.forEach()`.

---

## Proposed Changes

### 1. Optimize `getOrgEvents()` in `evntify/lib/db/organizer.ts`
- Replace querying the heavy `event_stats` view with an indexed, direct query on `registrations`:
  ```ts
  const eventIds = ((data ?? []) as Array<{ id: string }>).map((e) => e.id);
  const statsMap: Record<string, { registered_count: number; waitlist_count: number }> = {};
  eventIds.forEach((id) => {
    statsMap[id] = { registered_count: 0, waitlist_count: 0 };
  });

  if (eventIds.length > 0) {
    const { data: regRows } = await supabase
      .from("registrations")
      .select("event_id, status")
      .in("event_id", eventIds)
      .in("status", ["registered", "waitlisted"]);

    if (regRows) {
      regRows.forEach((r) => {
        if (r.status === "registered") statsMap[r.event_id].registered_count++;
        else if (r.status === "waitlisted") statsMap[r.event_id].waitlist_count++;
      });
    }
  }
  ```

### 2. Eliminate Redundant Auth & Membership Lookups in `app/organizer-dashboard/page.tsx`
- In `page.tsx`, resolve the authenticated `user` and their `organization_members` record once at the top level:
  ```ts
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, organization_members ( organization_id, organizations ( name ) )")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "organizer" && profile?.role !== "admin") redirect("/my-events");
  ```
- Extract `orgId`, `orgName`, and `organizerName` from this single query.
- Pass `orgId` directly into `getOrgEvents(orgId)` and `getOrgRoster(orgId, firstEventId)` instead of having each function call `getUser()` and query `organization_members` again.

### 3. Streamline `getOrgRoster()` in `lib/db/organizer.ts`
- Accept the optional pre-resolved `eventId` or default to the first event from `getOrgEvents()`, avoiding the sequential fallback query.
- Remove redundant join `events ( category )` inside `registrations` select; assign the category directly from the parent event.

### 4. Optimize `getOrganizers()` in `lib/db/stats.ts`
- Refactor `getOrganizers()` to query grouped counts or count projections instead of fetching all full rows across all organizations into Node.js memory.

---

## Verification Plan

### Automated Checks
- Run `npm run build` in `evntify` to ensure TypeScript compilation, route generation, and Turbopack bundling succeed with zero errors.
- Run `npm run lint` to verify clean code formatting and linting rules.

### Functional Verification
- Navigate to `/organizer-dashboard` and verify:
  - Page renders rapidly (sub-500ms) with zero duplicate auth round-trips.
  - Event cards show accurate registration counts, capacity labels, and correct badges ("Live • Approved", "Sold Out", etc.).
  - Attendance roster correctly lists attendees for the active event.
  - Check-in scanner and manual ticket checks remain fully operational.
- Navigate to `/admin/user-and-organizer` and verify organizer list displays correct pending proposals and active event counts without memory bloat.
