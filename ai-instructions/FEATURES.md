# Features — Finance Tracker

Tracks implemented, in-progress, and planned features.
**Format rules (required for Launchpad parser):**
- Each feature is a `### Feature Name` heading
- Status must be exactly: `planned` | `in-progress` | `implemented`

---

## Phase 1 — MVP

### Quick expense entry
**status:** implemented
**description:** Amount-first numpad screen with category chips on the same view. Three taps from open to saved, no network required.
**date_implemented:** 2026-07-27
**depends_on:** Local ledger database
**blocked_by:** —

### Local ledger database
**status:** implemented
**description:** SQLite on device behind a Store interface, raw SQL with a user_version migration runner. Append-only entries with UUID, updated_at and soft delete. Money stored as integer øre.
**date_implemented:** 2026-07-27
**depends_on:** —
**blocked_by:** —

### Category system
**status:** implemented
**description:** Eight starter categories seeded on first run. Add, rename, recolour, and non-destructive archive and restore. Reordering and pinning not built yet.
**date_implemented:** 2026-07-27
**depends_on:** Local ledger database
**blocked_by:** —

### Entry edit, delete and undo
**status:** in-progress
**description:** Soft delete works — tap an entry to reveal its delete action. Editing an existing entry and the post-save undo snackbar are not built yet.
**date_implemented:** —
**depends_on:** Quick expense entry
**blocked_by:** —

### Income logging
**status:** implemented
**description:** Log money in — salary, refunds, gifts — as a distinct entry type that offsets spending.
**date_implemented:** 2026-07-27
**depends_on:** Local ledger database
**blocked_by:** —

### Month overview
**status:** implemented
**description:** Landing screen showing spent, left to spend, daily allowance for the remaining days, and today's entries.
**date_implemented:** 2026-07-27
**depends_on:** Local ledger database
**blocked_by:** —

### Category breakdown
**status:** implemented
**description:** Horizontal bars per category for the selected month, ranked by spend and scaled against the largest, with month-over-month comparison and biggest expenses.
**date_implemented:** 2026-07-27
**depends_on:** Category system
**blocked_by:** —

### Danish locale and currency formatting
**status:** implemented
**description:** DKK formatting as 1.234,50 kr., Monday-first weeks, Europe/Copenhagen dates throughout.
**date_implemented:** 2026-07-27
**depends_on:** —
**blocked_by:** —

### CSV and Excel export
**status:** planned
**description:** Export any date range, so the data is never trapped in the app.
**date_implemented:** —
**depends_on:** Local ledger database
**blocked_by:** —

---

## Phase 2 — Planning and reach

### Scheduled and recurring items
**status:** implemented
**description:** Recurring rules with amount, cycle and next due date. They post themselves on their date and advance, catching up anything missed while the app was closed, and never backfill dates already past when first added.
**date_implemented:** 2026-07-28
**depends_on:** Local ledger database
**blocked_by:** —

### Subscription overview
**status:** implemented
**description:** All scheduled outgoings in one list with a single monthly total and a yearly figure. Weekly and yearly items are normalised to a monthly equivalent, using 52 weeks a year rather than four weeks a month.
**date_implemented:** 2026-07-28
**depends_on:** Scheduled and recurring items
**blocked_by:** —

### Calendar month view
**status:** implemented
**description:** Month grid marking money in and out — logged entries for past days, scheduled occurrences for future ones — with the selected day listed beneath.
**date_implemented:** 2026-07-28
**depends_on:** Scheduled and recurring items
**blocked_by:** —

### Forward balance projection
**status:** implemented
**description:** Projects from the balance anchor using logged entries since it, scheduled items up to the target date, and an estimate of ordinary spending. Answers "how much will I have on the 20th" for any day, plus a 30-day figure.
**date_implemented:** 2026-07-28
**depends_on:** Calendar month view, Balance anchor
**blocked_by:** —

### Balance anchor
**status:** implemented
**description:** A current-balance figure the user updates whenever convenient, with an age warning once it goes stale. All projection runs from it, and re-anchoring corrects accumulated drift.
**date_implemented:** 2026-07-28
**depends_on:** Local ledger database
**blocked_by:** —

### Monthly budget
**status:** in-progress
**description:** One overall monthly budget covering variable spending, with left-to-spend, a daily allowance for the days remaining, and a pace marker showing where the calendar says you should be. Per-category budgets not built yet.
**date_implemented:** —
**depends_on:** Category system
**blocked_by:** —

### Android home screen widget
**status:** in-progress
**description:** A "Log expense" widget that deep links straight into the numpad, proving Expo can ship a real Android App Widget. Showing live figures such as left-to-spend needs the widget to read the database from a headless context, which is not built yet.
**date_implemented:** 2026-07-28
**depends_on:** Quick expense entry
**blocked_by:** —

### Budget push notifications
**status:** planned
**description:** Daily allowance in the morning, threshold alerts, weekly summary and a payday reset — the numbers come to the user rather than waiting to be opened.
**date_implemented:** —
**depends_on:** Monthly budget
**blocked_by:** —

### Device sync
**status:** planned
**description:** Last-write-wins sync between phone and server so PC and phone changes appear on each other. Phone stays fully usable offline.
**date_implemented:** —
**depends_on:** Local ledger database
**blocked_by:** —

### PC web app
**status:** planned
**description:** Next.js app for the report-heavy and fiddly work: bulk re-categorisation, budget setup, subscription management, keyboard-fast entry.
**date_implemented:** —
**depends_on:** Device sync
**blocked_by:** —

### App lock
**status:** planned
**description:** Biometric or PIN lock with auto-lock on background and amounts blurred in the app switcher.
**date_implemented:** —
**depends_on:** —
**blocked_by:** —

---

## Phase 3 — Effort removal

### Notification capture inbox
**status:** planned
**description:** Reads Google Wallet and MobilePay payment notifications into a pending inbox with amount and merchant pre-filled, awaiting a one-tap confirm.
**date_implemented:** —
**depends_on:** Quick expense entry
**blocked_by:** Notification listener spike

### Recent-notification prefill
**status:** planned
**description:** Opening the app shortly after a payment notification jumps straight to a pre-filled entry instead of an empty numpad.
**date_implemented:** —
**depends_on:** Notification capture inbox
**blocked_by:** —

### Receipt OCR autofill
**status:** planned
**description:** On-device text recognition reads total and merchant from a receipt photo and pre-fills the entry.
**date_implemented:** —
**depends_on:** Quick expense entry
**blocked_by:** —

### Auto-categorisation rules
**status:** planned
**description:** User-defined and learned rules that map merchant text to a category, so captured payments arrive already categorised.
**date_implemented:** —
**depends_on:** Category system
**blocked_by:** —

### Batch tidy-up screen
**status:** planned
**description:** Swipe through uncategorised entries and assign them in bulk, so logging fast never means logging wrong.
**date_implemented:** —
**depends_on:** Category system
**blocked_by:** —

### End-to-end encrypted sync
**status:** planned
**description:** Client-side encryption of the entry payload so the server only ever holds ciphertext. Passphrase-derived key with a written recovery code.
**date_implemented:** —
**depends_on:** Device sync
**blocked_by:** —
