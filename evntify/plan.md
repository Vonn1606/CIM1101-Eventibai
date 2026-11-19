# Evntify — Full-Stack Architecture & Security Audit Plan

> **Audit Date:** November 19, 2026  
> **Auditor:** Senior Full-Stack Architect & Security Engineer (AI-assisted)  
> **Scope:** Next.js 16 / React 19 app + Supabase PostgreSQL backend  
> **Stack:** Next.js 16.4.1, React 19, TypeScript, Tailwind CSS 4, Supabase (@supabase/ssr 0.12.7), Zod 4

---

## 1. System Overview & Current State

### ✅ What Is Working
| Area | Status |
|------|--------|
| Auth flows (sign-up, sign-in, role-based redirect) | Functional |
| Server-side admin guard (`app/admin/layout.tsx`) | Secure — uses `getUser()` + DB role check |
| Organizer dashboard page-level guard | Functional |
| Event listing (`/events`) with featured hero | Functional |
| Event detail page with SSR + registration | Functional |
| Event registration via RPC `register_for_event` | Functional |
| Venue conflict check (`check_venue_conflict` RPC) | Functional |
| Waitlist logic (capacity-based inside the RPC) | Functional |
| Admin approval flow (`decide_approval` RPC) | Functional |
| Broadcast messaging via `send_broadcast` RPC | Functional |
| Notification page with realtime subscription | Functional |
| Organizer application + admin approval flow | Functional |
| Event cancellation via `cancel_event` RPC | Functional |
| Mark-all-read / dismiss notifications | Functional |
| `My Events` page (calendar + past events) | Functional |
| RLS enabled on all 20 tables | ✅ All tables covered |
| Supabase service role key **not** used in client | ✅ Secure |

### ❌ What Is Broken / Missing
| Area | Status |
|------|--------|
| No `middleware.ts` source file — route protection only via page-level guards | ⚠️ Defense gap |
| `database.ts` types are **stale** — `organizer_applications` table not in types | ⚠️ Type-unsafe |
| `profiles` INSERT policy missing — first-time signup relies entirely on `handle_new_user` trigger | ⚠️ Potential gap |
| `registrations` INSERT policy missing — relies 100% on `register_for_event` security-definer RPC | ⚠️ Acceptable but undocumented |
| "Forgot Password" link goes to `#forgot-password` anchor (not a real route) | ❌ Broken flow |
| `rememberMe` checkbox on sign-in is visually present but has no effect | ❌ Dead UI |
| `SelectedDayPreview` component is non-functional (no calendar day selection state) | ❌ Incomplete |
| `event_stats` VIEW has no RLS — any authenticated user can query any event's stats | ⚠️ Info leak |
| Admin can update `profiles.role` through `decideOrganizerApplication` but bypasses RLS `WITH CHECK` clause | ⚠️ Security note |
| `(supabase as any)` escape used 25+ times — `organizer_applications` table missing from types | ❌ Type debt |
| No global error boundary / fallback UI for failed server actions | ❌ Missing |
| No rate limiting on sign-up / registration server actions | ❌ Missing |
| `audit_logs` direct-insert policy removed (migration `20261109`) but app still calls `supabase.from("audit_logs").insert(...)` directly in `admin.ts` | ⚠️ Will silently fail |
| SMS/Discord broadcast channels are `queued` only — no actual delivery implementation | ❌ Stub only |
| `lib/events.ts` file at the lib root appears unused/orphaned | ❌ Dead code |
| No `loading.tsx` for `/notifications` or `/events/[id]` route | ⚠️ UX gap |
| 8 `<img>` tags instead of Next.js `<Image />` (reported by ESLint) | ⚠️ Performance |
| `next.config.ts` enables `experimental.agentFeedback` — should be removed before production | ⚠️ Prod config |

---

## 2. Supabase Security & Access Audit

### 2.1 Key Exposure
| Key | Location | Exposure Risk |
|-----|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | ✅ Public — expected |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | ✅ Public — expected; uses anon key only |
| `service_role` key | Not found anywhere | ✅ Not exposed |

> [!IMPORTANT]
> Both the browser client (`lib/supabase/client.ts`) and server client (`lib/supabase/server.ts`) use only `NEXT_PUBLIC_SUPABASE_ANON_KEY`. **No `service_role` key exists in any source file.** This is correct.

### 2.2 RLS Coverage — Table-by-Table

| Table | RLS | SELECT | INSERT | UPDATE | DELETE | Notes |
|-------|-----|--------|--------|--------|--------|-------|
| `profiles` | ✅ | own + admin/organizer can read | ❌ No explicit policy (relies on trigger) | own only, role-tamper blocked | ❌ No policy | Admin role promotion in `decideOrganizerApplication` does a direct `.update({role})` from server action — works because server action runs with anon key but `requireAdmin()` guards it at app layer. RLS `WITH CHECK` blocks self-escalation. |
| `events` | ✅ | Approved + non-draft public, owner/admin see own | organizer/admin only, org-member verified | owner if pending/returned; admin always | ❌ No policy | No delete policy is acceptable (events should never be hard-deleted). |
| `registrations` | ✅ | own user or event owner | ❌ No policy (RPC only) | own cancel or admin | ❌ No policy | Intentional — `register_for_event` is security-definer and handles all inserts. Direct insert is blocked correctly. |
| `event_approvals` | ✅ | admin or submitter | organizer/admin, own event in pending | admin only | ❌ No policy | Good — no delete prevents approval history tampering. |
| `notifications` | ✅ | own | own (all policy) | own | own | `for all using (user_id = auth.uid())` covers everything. |
| `colleges` | ✅ | public read | ❌ No policy | ❌ No policy | ❌ No policy | Correct — colleges are seed data, only admin should mutate via Supabase dashboard. |
| `organizations` | ✅ | public read | ❌ No policy | ❌ No policy | ❌ No policy | ⚠️ `decideOrganizerApplication` does a server-side `.insert()` for new orgs — this will fail under RLS if no insert policy exists for admins. |
| `organization_members` | ✅ | authenticated read | admin only (via policy) | ❌ No policy | ❌ No policy | `decideOrganizerApplication` does `.upsert()` on `organization_members` as admin — same risk as organizations. |
| `venues` | ✅ | public read | ❌ No policy | ❌ No policy | ❌ No policy | Admin-only via Supabase dashboard — acceptable. |
| `venue_closures` | ✅ | public read | admin only | admin only | admin only via `admin manages venue_closures` | ✅ Good. |
| `event_features` | ✅ | public read | owner if pending/returned | owner if pending/returned | owner | ✅ Good. |
| `event_facilities` | ✅ | (via admin action server-side) | owner | owner | owner | ✅ Good. |
| `event_documents` | ✅ | approved events public, owner/admin | organizer/admin | ❌ No policy | ❌ No policy | Acceptable for now. |
| `admin_notes` | ✅ | admin only | admin only | ❌ No policy | ❌ No policy | ✅ Good. |
| `audit_logs` | ✅ | admin read | ❌ No policy (direct-insert policy was dropped in migration `20261109`) | ❌ No policy | ❌ No policy | ⚠️ **CRITICAL:** `app/actions/admin.ts` calls `supabase.from("audit_logs").insert(...)` directly in `suspendEvent()` and `setFeatured()`. These will silently fail because no INSERT policy exists. Only `log_audit()` security-definer RPC is allowed. |
| `broadcasts` | ✅ | owner/admin | owner + event check | ❌ No policy | ❌ No policy | ✅ Good. |
| `broadcast_deliveries` | ✅ | staff (organizer/admin) | staff | staff | staff | ✅ Good. |
| `check_ins` | ✅ | event owner | event owner | event owner | event owner | ✅ Good. |
| `gates` | ✅ | staff | ❌ No policy | ❌ No policy | ❌ No policy | Low risk — gates are static data. |
| `organizer_applications` | ✅ | own + admin | own (user_id = auth.uid()) | admin only | admin only | ✅ Good. |
| `event_stats` (VIEW) | ❌ Not an RLS-enabled table | Queryable by any authenticated user | — | — | — | ⚠️ Any authenticated user can query stats for any event including private/draft events. Consider using `security_invoker = true` or restricting to a function. |

### 2.3 Security Definer Functions Audit

| Function | Purpose | Caller Guard | Risk |
|----------|---------|-------------|------|
| `register_for_event` | Insert registration | Checks approved status, deadline, capacity | ✅ Secure |
| `decide_approval` | Admin-only approval flow | `is_admin()` check inside | ✅ Secure |
| `suspend_event` | Admin suspend | `is_admin()` check inside | ✅ Secure |
| `cancel_event` | Organizer/admin cancel | `user_owns_event()` check | ✅ Secure |
| `send_broadcast` | Fan-out push | `user_owns_event()` check | ✅ Secure |
| `notify_event_registrants` | Bulk notification | `user_owns_event()` check | ✅ Secure |
| `handle_new_user` | Auto-create profile | Trigger, no caller | ✅ Secure |
| `log_audit` | Audit logging | role check inside | ✅ Secure |
| `user_owns_event` | Ownership helper | Stable helper, no side effects | ✅ Secure |
| `is_admin` | Admin check | Stable helper | ✅ Secure |
| `current_role_is` | Role check | Stable helper | ✅ Secure |

### 2.4 Client-Side Auth Pattern

> [!WARNING]
> `lib/use-auth.ts` uses `getSession()` (reads local storage) instead of `getUser()` (server-verified). This means the client-side auth state **is not cryptographically verified**. For page-level UI gating this is acceptable, but server actions and API routes all correctly call `supabase.auth.getUser()`. The pattern is intentional and follows Supabase's recommended hybrid approach.

> [!NOTE]
> The module-level `cachedProfile` / `cachedUserId` variables in `use-auth.ts` are shared across all component instances in the same browser tab, which is the intended optimization. However, this cache is **never invalidated on role change** without a page reload (e.g., after an admin promotes a user to organizer).

---

## 3. System Gaps & Missing Components

### 3.1 Architectural Gaps

1. **No `middleware.ts` source file** — Route protection depends entirely on page-level guards in layouts and Server Components. Next.js Middleware would provide a more robust first line of defense to redirect unauthenticated users before any RSC rendering begins.

2. **Stale `types/database.ts`** — The `organizer_applications` table added in migration `20261114` is not in the generated types. This forces 25+ `(supabase as any)` escape casts throughout `organizer-application.ts`, `stats.ts`, `organizer.ts`, and `broadcasts.ts`, losing all type safety.

3. **Audit log direct inserts will silently fail** — `app/actions/admin.ts` calls `.from("audit_logs").insert()` directly in the `suspendEvent()` fallback and `setFeatured()`. Migration `20261109` dropped the direct-insert policy and replaced it with the `log_audit()` RPC. These two functions must be updated.

4. **Organizations INSERT/UPDATE policy gap** — `decideOrganizerApplication()` at line 174 calls `supabase.from("organizations").insert(...)` for new orgs and `.upsert()` on `organization_members`. No RLS policy allows admin-role users to insert/update these tables. These calls run from a server action with the anon key — they will fail silently.

5. **No password reset flow** — The "Forgot Password?" link on the sign-in form points to `#forgot-password` (a dead anchor). No `/forgot-password` route exists in the app.

### 3.2 Missing Features / Incomplete User Flows

6. **`SelectedDayPreview` component is a stub** — `component/user-profile/SelectedDayPreview.tsx` renders without any `selectedDay` prop or state management. Clicking a calendar day does nothing on the My Events page.

7. **`rememberMe` checkbox does nothing** — The checkbox in `SignInForm` toggles local state but Supabase `signInWithPassword` always uses the default session persistence. The UI is misleading.

8. **SMS / Discord broadcast channels are stubs** — The broadcast feature creates `queued` delivery rows for `sms` and `discord` channels but no actual sending logic or webhook/API integration exists.

9. **QR Code generation only on client** — QR codes are generated via the `qrcode` library entirely client-side in `event-details-client.tsx`. If `qr_enabled` is `false` for an event, the UI still shows the QR placeholder but the flag is not checked.

10. **No email confirmation redirect handling** — The signup action calls `supabase.auth.signUp()` and returns `{ success: true }` without confirming whether the user needs to verify email. No `/verify-email` page or confirmation message exists.

11. **`app/organizer-dashboard/create-event/page.tsx` does not check organization membership** — The page redirects non-organizers but does not handle the edge case of an organizer with no linked organization (`getOrgProfile()` returns `orgName: "My Organisation"` as a fallback, which would create an event with no real org_id).

12. **Calendar in `My Events` is view-only** — Only marks event days. No click interaction links to events.

13. **No loading state for `/events/[id]` route** — There is no `loading.tsx` for the event detail route segment. The fallback for the route is `not-found.tsx` only.

14. **No global error boundary** — There is an `app/events/error.tsx` but no root-level `error.tsx`. Unhandled errors in admin, organizer dashboard, and notification pages show a blank Next.js error screen.

### 3.3 Code Quality Issues

15. **`lib/events.ts` is an orphaned file** — The file at `evntify/lib/events.ts` appears to be a legacy file not imported anywhere. `lib/db/events.ts` is the actual module used.

16. **8× `<img>` instead of `<Image />`** — ESLint flags this in: `event-details-client.tsx`, `notifications/page.tsx`, `organizer-dashboard-client.tsx`, `component/admin/Sidebar.tsx`, `eventsnavbar.tsx`, `landingpage/header.tsx`, `login/layout-login/header.tsx`, `user-profile/Header.tsx`.

17. **`experimental.agentFeedback: true`** — Present in `next.config.ts`. Must be removed before any production build/deployment.

18. **Slug-to-UUID resolution repeated 5× in `app/actions/admin.ts`** — The pattern of checking if a string is a UUID, then falling back to a slug lookup, is copy-pasted across `saveAdminNote`, `suspendEvent`, `setFeatured`, `getEventFacilities`, and `getEventAdminNotes`. Should be extracted to a shared `resolveEventId()` utility.

19. **`requireAdmin()` does an extra DB round-trip** — Called once in `approvals.ts` and multiple times in `admin.ts`; each call fetches the profile row again even though the calling server action could pass role info down.

---

## 4. Prioritized Action Plan

### 🔴 Phase 1: Critical & Security Fixes

> [!CAUTION]
> These items affect data integrity, authentication security, or cause silent failures in production.

- [ ] **P1-1 — Fix audit_log direct inserts** (`app/actions/admin.ts`)
  - In `suspendEvent()`: Replace the fallback `supabase.from("audit_logs").insert(...)` with a call to `supabase.rpc("log_audit", {...})`.
  - In `setFeatured()`: Replace `supabase.from("audit_logs").insert(...)` with `supabase.rpc("log_audit", {...})`.
  - **Files:** `evntify/app/actions/admin.ts` lines ~86 and ~160.

- [ ] **P1-2 — Add RLS policies for `organizations` and `organization_members` mutations**
  - Create a new migration (e.g., `20261120000000_org_admin_policies.sql`).
  - Add `for insert` and `for update` policies on `public.organizations` gated on `public.is_admin()`.
  - Add `for update` and `for delete` policies on `public.organization_members` gated on `public.is_admin()`.
  - **Files:** New migration file in `evntify/supabase/migrations/`.

- [ ] **P1-3 — Regenerate `types/database.ts`** to include `organizer_applications`
  - Run: `npm run db:types` (which calls `supabase gen types typescript --project-id ifuxpgeprlfsqqbkpxnq --schema public > types/database.ts`).
  - Remove all `(supabase as any)` casts in `app/actions/organizer-application.ts`, `lib/db/organizer.ts`, `lib/db/stats.ts`, and `app/actions/broadcasts.ts`.
  - **Files:** `evntify/types/database.ts` + 4 action/lib files.

- [ ] **P1-4 — Add a Next.js `middleware.ts`** as a first-line auth gate
  - Create `evntify/middleware.ts` using `@supabase/ssr` `createServerClient` to check session before rendering protected routes (`/admin/*`, `/organizer-dashboard/*`, `/my-events`, `/notifications`).
  - Redirect unauthenticated users to `/signin?next=<path>`.
  - **Reference:** Supabase SSR middleware docs pattern.

- [ ] **P1-5 — Invalidate `useAuth` profile cache on role change**
  - After `decideOrganizerApplication()` promotes a user, the in-memory `cachedProfile` on the client becomes stale.
  - Add a cache-busting mechanism: either use a versioned key, listen to `SIGNED_IN` events, or simply clear `cachedUserId = null` after role-sensitive operations.
  - **Files:** `evntify/lib/use-auth.ts`.

- [ ] **P1-6 — Restrict `event_stats` VIEW access**
  - Either recreate the view `WITH (security_invoker = true)` so it respects the caller's RLS, or wrap it in a security-definer function that filters by `auth.uid()`.
  - Add a migration to do this.
  - **Files:** New migration in `evntify/supabase/migrations/`.

- [ ] **P1-7 — Remove `experimental.agentFeedback: true` from `next.config.ts`**
  - **File:** `evntify/next.config.ts` line 5.

---

### 🟡 Phase 2: Missing Features & Core Gaps

- [ ] **P2-1 — Build the Forgot Password flow**
  - Create `app/forgot-password/page.tsx` with a form that calls `supabase.auth.resetPasswordForEmail()`.
  - Create `app/reset-password/page.tsx` to handle the callback URL.
  - Update the link in `component/login/signin/signinform.tsx` from `#forgot-password` to `/forgot-password`.

- [ ] **P2-2 — Wire `SelectedDayPreview` to calendar state**
  - Add `selectedDay: number | null` state to `app/my-events/page.tsx` or lift it into `CalendarCard`.
  - Pass a click handler from the page into `CalendarCard` and pass the selected day's events into `SelectedDayPreview`.
  - **Files:** `app/my-events/page.tsx`, `component/user-profile/CalendarCard.tsx`, `component/user-profile/SelectedDayPreview.tsx`.

- [ ] **P2-3 — Fix `rememberMe` checkbox** or remove it
  - If desired: pass a session expiry to `signInWithPassword` using Supabase's `options.data` or handle it via `supabase.auth.setSession()` / `localStorage`.
  - If not desired: remove the checkbox from `component/login/signin/signinform.tsx` to avoid UI deception.

- [ ] **P2-4 — Guard QR display against `qr_enabled` flag**
  - In `app/events/[id]/event-details-client.tsx`, check `event.qrEnabled` (exposed from `lib/db/events.ts`) before rendering the QR modal section.
  - Expose `qr_enabled` from `rowToEventDetail()` in `lib/db/events.ts`.

- [ ] **P2-5 — Email confirmation handling on sign-up**
  - After `signUp()` returns `{ success: true }`, show a "Check your email" message rather than silently completing.
  - If Supabase email confirmation is disabled in the project settings, document this explicitly.
  - **File:** `component/login/signup/signupform.tsx`.

- [ ] **P2-6 — Guard create-event for organizers with no organization**
  - In `app/organizer-dashboard/create-event/page.tsx`, redirect to `/organizer-dashboard` with an error message if `getOrgProfile()` returns `orgName === "My Organisation"` (the fallback string).
  - **Files:** `app/organizer-dashboard/create-event/page.tsx`, `lib/db/organizer.ts`.

- [ ] **P2-7 — Add a root-level `error.tsx`**
  - Create `app/error.tsx` as a global error boundary to catch unhandled RSC or server action errors and display a user-friendly fallback.
  - **File:** `evntify/app/error.tsx` (create new).

- [ ] **P2-8 — Add `loading.tsx` for missing route segments**
  - Create `app/events/[id]/loading.tsx` with a skeleton/spinner.
  - Create `app/notifications/loading.tsx`.
  - **Files:** 2 new files.

- [ ] **P2-9 — Add server-side rate limiting on auth and registration actions**
  - For `app/actions/auth.ts` (signUp) and `app/actions/registration.ts` (registerForEvent): add IP-based rate limiting using Next.js `headers()` + an in-memory or Redis-backed counter, or Supabase's built-in auth rate limits in the dashboard.
  - As a minimum: add a `x-forwarded-for` check and a simple token-bucket approach.

- [ ] **P2-10 — Implement or remove SMS/Discord broadcast stubs**
  - Either integrate a real SMS provider (e.g., Twilio) and Discord webhook in `app/actions/broadcasts.ts`, or remove the `sms` and `discord` options from the UI in `app/organizer-dashboard/organizer-dashboard-client.tsx` to avoid creating misleading `queued` rows.

---

### 🟢 Phase 3: Cleanup, Testing & Optimization

- [ ] **P3-1 — Delete orphaned `lib/events.ts`**
  - Verify it is not imported anywhere: `Select-String -Recurse -Path evntify -Pattern "from.*lib/events"`.
  - Delete `evntify/lib/events.ts`.

- [ ] **P3-2 — Replace all `<img>` with `<Image />`** in the 8 flagged files
  - `app/events/[id]/event-details-client.tsx:185`
  - `app/notifications/page.tsx:451`
  - `app/organizer-dashboard/organizer-dashboard-client.tsx:368`
  - `component/admin/Sidebar.tsx:41`
  - `component/dashboard/events/eventsnavbar.tsx:51`
  - `component/landingpage/header.tsx:24`
  - `component/login/layout-login/header.tsx:11`
  - `component/user-profile/Header.tsx:47`
  - Add image domain(s) to `next.config.ts` → `images.remotePatterns` as needed.

- [ ] **P3-3 — Extract `resolveEventId()` utility in `app/actions/admin.ts`**
  - The slug→UUID resolution block is copy-pasted 5 times. Extract to a private async helper at the top of the file.
  - **File:** `evntify/app/actions/admin.ts`.

- [ ] **P3-4 — Memoize or cache `requireAdmin()` within a request**
  - `requireAdmin(supabase, user.id)` hits the DB on every call. Since the user object is already fetched in the same server action, pass the role as a parameter rather than fetching again.
  - **File:** `evntify/app/actions/admin.ts`, `evntify/app/actions/approvals.ts`.

- [ ] **P3-5 — Type-safe RPC calls**
  - After regenerating `database.ts` (P1-3), remove all `(supabase.rpc as any)(...)` casts in:
    - `app/actions/events.ts` (checkVenueAvailability, cancelEvent, notify_event_registrants)
    - `app/actions/registration.ts` (register_for_event)
    - `app/actions/broadcasts.ts` (send_broadcast)

- [ ] **P3-6 — Add `<noscript>` fallbacks and accessibility labels**
  - Several icon-only buttons (e.g., the Mark All Read button in `notifications/page.tsx`, the sidebar nav icons in `admin`) lack `aria-label` attributes.
  - Add `role="status"` to loading spinners and `aria-live="polite"` to error message regions.

- [ ] **P3-7 — Remove commented-out config in `next.config.ts`**
  - Lines `// cacheComponents: true` and `// partialPrefetching: true` are commented-out experimental options. Clean these up.
  - **File:** `evntify/next.config.ts`.

- [ ] **P3-8 — Add `tsconfig.json` strict null checks verification**
  - Run `npx tsc --noEmit` and resolve any type errors introduced when `(supabase as any)` casts are removed.

- [ ] **P3-9 — Write integration tests for critical paths**
  - Registration happy path (registered → waitlisted when full).
  - Admin approval → event goes live.
  - Self-escalation prevention (student cannot set their own role to admin).
  - Venue conflict rejection.

- [ ] **P3-10 — Set `Content-Security-Policy` and security headers in `next.config.ts`**
  - Add `headers()` returning `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a basic `Content-Security-Policy`.

---

## 5. Database Schema Summary

```
colleges                 (4 seed rows, public read only)
profiles                 (1:1 auth.users, RLS ✅)
organizations            (public read, admin write — missing write RLS ⚠️)
organization_members     (authenticated read, admin write — missing write RLS ⚠️)
venues                   (public read, admin-only write)
venue_closures           (public read, admin write ✅)
events                   (complex RLS ✅)
event_features           (public read, owner write ✅)
event_facilities         (admin read, owner write ✅)
event_approvals          (submitter/admin read, admin decide ✅)
event_documents          (public read approved, organizer insert ✅)
registrations            (own read, RPC insert only ✅)
gates                    (staff read only)
check_ins                (event owner all ✅)
broadcasts               (owner read/insert ✅)
broadcast_deliveries     (staff ✅)
notifications            (own all ✅)
admin_notes              (admin only ✅)
audit_logs               (admin read, NO insert policy ⚠️)
organizer_applications   (own + admin ✅)

VIEW: event_stats        (no RLS — any authenticated user can read ⚠️)
```

---

## 6. Quick Reference: Critical File Paths

| Concern | File |
|---------|------|
| Supabase browser client | `evntify/lib/supabase/client.ts` |
| Supabase server client | `evntify/lib/supabase/server.ts` |
| Auth hook (client) | `evntify/lib/use-auth.ts` |
| Zod validation schemas | `evntify/lib/validations.ts` |
| DB event queries | `evntify/lib/db/events.ts` |
| DB organizer queries | `evntify/lib/db/organizer.ts` |
| DB admin/stats queries | `evntify/lib/db/stats.ts` |
| Auth server actions | `evntify/app/actions/auth.ts` |
| Event server actions | `evntify/app/actions/events.ts` |
| Registration server action | `evntify/app/actions/registration.ts` |
| Admin server actions | `evntify/app/actions/admin.ts` |
| Approvals server action | `evntify/app/actions/approvals.ts` |
| Broadcast server action | `evntify/app/actions/broadcasts.ts` |
| Organizer application | `evntify/app/actions/organizer-application.ts` |
| Admin route guard | `evntify/app/admin/layout.tsx` |
| Client role guard component | `evntify/component/auth/role-guard.tsx` |
| DB type definitions | `evntify/types/database.ts` |
| Initial schema migration | `evntify/supabase/migrations/20261102061305_eventify_schema.sql` |
| Security/RLS migration | `evntify/supabase/migrations/20261107190000_security_and_rls_fixes.sql` |
| Ownership & RPC migration | `evntify/supabase/migrations/20261109140000_ownership_helpers_and_rpc.sql` |
| Organizer apps migration | `evntify/supabase/migrations/20261114160000_organizer_applications.sql` |
| Lifecycle helpers migration | `evntify/supabase/migrations/20261115200000_events_lifecycle_and_helpers.sql` |
