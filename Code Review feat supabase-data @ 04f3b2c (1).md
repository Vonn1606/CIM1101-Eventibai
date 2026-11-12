'			# Code Review: feat/supabase-data @ 04f3b2c

Nov 8, 2026 · @Vonn

Commit 04f3b2c fixes many earlier findings but adds a migration that will not apply plus a few regressions; tick items off below as you fix them.

Static read only: nothing was built or run in the review environment. Not opened: `organizer-dashboard-client.tsx`, `create-event-form.tsx`, `ApReviewModal` internals, `event-details-client.tsx`, `signupform.tsx`, `types/*`. The "done" and "new" lists compare 04f3b2c with the earlier review of commit 5337fa7; the clone was shallow, so I could not produce a git diff.

## What the latest push (04f3b2c) did

Fixed since the earlier review:

- [x] `decision_note` column used in `decideApproval`
- [x] `waitlist_count` and `position` field names corrected
- [x] Admin events directory reads counts from the `event_stats` view instead of an embed
- [x] `/login` redirect now goes to `/signin`; the `/\` open redirect is blocked
- [x] `generateStaticParams` removed from the event page
- [x] Registration resolves slug to UUID and calls the RPC with the right arguments
- [x] Saved event times use the Manila offset (`+08:00`)
- [x] `registerSchema.college` is dynamic; registration deadline is checked
- [x] Event page loads the user's existing registration
- [x] `submitEvent` checks organization membership on the server and returns an error if the approval insert fails
- [x] Dev auth bypass (`DISABLE_AUTH_FOR_DEV`) removed; `middleware.ts` guards `/admin`, `/organizer-dashboard` and `/my-events` by role
- [x] CI workflow added (lint, `tsc --noEmit`, build)

Added by the push (new code, with the problems listed in the to-do below):

- A security and RLS migration, `20261107190000_security_and_rls_fixes.sql`
- `updateEvent` in `app/actions/events.ts`
- `app/actions/admin.ts`: `saveAdminNote`, `suspendEvent`, `getEventFacilities`, `getEventAdminNotes`, used by the event inspector
- `app/actions/broadcasts.ts`: `sendBroadcast`, `getBroadcastLogs`
- QR tickets using the new `qrcode` dependency (event page and `EventCards.tsx`)
- Removed: `app/data/*` mock data and `lib/db/admin.ts`

## To-do: Blockers (fix first)

- [x] **Migration fails to apply.** The `"owner or admin edits events"` policy uses `approval in ('pending','draft')`, but `'draft'` is an `event_status` value, not `approval_status`. Use `('pending','returned')`; decide whether owners may edit `returned` events. Then run `supabase db reset` to confirm the whole file applies.
	- [x] **Organizers cannot submit for approval.** `event_approvals` is now admin-write-only, but `submitEvent` and `updateEvent` insert as the organizer. Add an INSERT policy: `submitted_by = auth.uid()` and organizer role, ideally for the user's own pending events only.
- [x] **Any organizer can create events for any organization.** The `events` INSERT policy only checks role. Require `created_by = auth.uid()`, `approval = 'pending'` and membership in `organization_id`.
- [x] **New RLS tables lost write access.** `event_features`, `event_facilities` and `venue_closures` have only SELECT policies. Check whether the create-event flow writes them; add owner-scoped INSERT/UPDATE policies if so.
	- [x] **Install the new dependency locally.** Run `npm install` in `evntify/`, then `npm run build`, `npx tsc --noEmit`, `npm run lint`. The `qrcode` / `TS2307` / `TS7006` errors you reported come only from the missing install; no code change is needed. Send the lint result, which was cut off in the screenshot.

## To-do: Security and authorization

- [] **Ownership checks** (`userOwnsEvent` helper: creator, org member or admin). Use it in `toggleCheckIn`, `sendBroadcast`, `getOrgRoster(eventId)` (currently any organizer can read any event's attendee names and student numbers), and in the `check_ins` and `broadcasts` policies.
- [ ] Add an explicit admin guard (`requireAdmin()`) to `saveAdminNote`, `suspendEvent` and `decideApproval`.
- [x] **Audit log policy** `"staff write audit"` lets any logged-in user insert forged entries. Restrict to organizer/admin, or write audit rows only from security-definer functions.
- [x] **`sendBroadcast`:** inserts into `notifications` for other users are blocked by the own-only policy; SMS and Discord rows are marked "delivered" though nothing is sent (use `queued`); insert errors are not checked; `getBroadcastLogs` is unfiltered, so organizers see other organizations' broadcasts.
- [x] **`decideApproval`:** check the approval is still `pending`; check errors on the event update, notification and audit steps (or do them in one RPC transaction); remove the type casts.
- [ ] **Suspended events:** add `'suspended'` to the blocked statuses in `register_for_event`, exclude them in `getEvents` and `getEventBySlug`, and stop `rowToEventDetail` showing them as `OPEN`.
- [x] **Filter injection:** `getMyRegistrations` interpolates user input into `.or()`; use `.eq()` or `.in()` instead.
- [ ] **`updateEvent`:** block edits to approved or ongoing events, check organization membership (not only `created_by`), and verify the approval insert succeeded.
- [ ] **Sign-in form** bypasses `signInSchema` and still has an `as any`.
- [ ] **Email-domain restriction** is enforced only in the Server Action; add a DB-level check if it must be a hard rule.

## To-do: Functional bugs

- [ ] **Enum mismatch:** `"concluded"` is checked in `lib/db/events.ts` and `EdEventsView`, but the enum value is `completed`, so "Completed" never shows on public cards.
- [ ] **Timezones:** `lib/db/organizer.ts` uses `getMonth()` / `getDate()` in the server timezone (UTC in production), so events between 00:00 and 08:00 Manila time show the wrong day. Add `timeZone: "Asia/Manila"` in `rowToCampusEvent` and `my-events/page.tsx`, and format `registrationDeadline`.
- [ ] **Multi-org organizers:** `getOrgProfile` and `getOrgEvents` use `.single()` on `organization_members`, which errors for a user in two organizations. Use `.limit(1)` or fetch all.
- [ ] **Approval status flattened:** `returned` and `declined` events show as "Pending SAO Clearance"; the `archived` branch can never fire (not in the enum).
- [ ] **Admin events pager is not wired:** "Next" has no handler, "Previous" is always disabled, and the Active/Completed counts come from one page only. `suspended` is mapped to "completed".
- [ ] **Placeholders in admin approvals:** `RATE = 92` fallback, documents `"—"`, risk always `"Standard"`, check tone always green, endorsements always empty.
- [ ] **Invented data:** `getOrganizers` hardcodes `pendingProposals` and `activeEvents` to 0 and falls back to a made-up email; roster `eventTrack: "General"` and `tier: "Free RSVP"` are hardcoded; `toggleCheckIn` ignores `tier`.
- [ ] **"Main Campus"** is the fallback venue note in `getApprovals`; show nothing instead.
- [ ] `getFeaturedEvents` does not filter out past, cancelled or suspended featured events.
- [ ] Add a cancel-registration action and button (the RLS policy already allows it).
- [ ] `EdInspector` effects have no `.catch`, and stale facilities and notes can show from the previous event.

## To-do: Code quality

- [ ] Replace the \~60 `any` / `as` casts (up from 48) by generating `types/database.ts` with `supabase gen types typescript` and using typed selects. The project rule is no `any`.
- [ ] Resolve the `department` union conflict between `lib/db/events.ts` (`eng|sci|biz|art`) and `lib/department.ts`.
- [ ] Check the Next 16 docs on whether `middleware.ts` must become `proxy.ts` (not verified offline).
- [ ] Fix the `fetchStats` comment: views take no RLS policies; grants and the underlying tables decide access, and the view is not `security_invoker`. Decide that on purpose.
- [ ] Make the `handle_new_user` unique-violation error say which field collided so the sign-up form can show it.

## REMAINING\_TASKS.md status

- [x] 2.1 approvals schema fields, 2.2 registration RPC, 3.1 and 3.2 stats and directory queries, auth hardening, CI
- [ ] Security items 1-4 and 6: fixed in intent but blocked by the migration bug and regressions above
- [ ] Security item 5 (ownership checks): not done
- [ ] 3.3 organizer metrics (still hardcoded), 4.1 and 4.2 (gaps in broadcast and inspector actions), 6.2 (admin pager)
- [ ] Not started: cancel-registration flow, real SMS/Discord provider, generated DB types
- [ ] Unverified (components not opened): 4.4, 5.1, 5.2, 5.3, 6.3

## Suggested order

- [ ] Migration enum fix, then the missing INSERT policies; re-apply on a fresh local DB.
- [ ] `userOwnsEvent` and `requireAdmin` helpers used in every action.
- [ ] Audit and broadcast/notification policies; honest broadcast statuses.
- [ ] Block suspended events in the RPC and public queries.
- [ ] Enum mismatch, timezones, `.single()` calls.
- [ ] Wire the admin pager; remove placeholder numbers.
- [ ] Generate DB types and clear the casts.
- [ ] Run `npm run lint && npx tsc --noEmit && npm run build` before pushing.
