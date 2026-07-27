# Features — Finance Tracker

Tracks implemented, in-progress, and planned features.
**Format rules (required for Launchpad parser):**
- Each feature is a `### Feature Name` heading
- Status must be exactly: `planned` | `in-progress` | `implemented`

---

## Phase 1 — MVP

### Quick expense entry
**status:** planned
**description:** Amount-first numpad screen with category chips on the same view. Three taps from open to saved, no network required.
**date_implemented:** —
**depends_on:** Local ledger database
**blocked_by:** —

### Local ledger database
**status:** planned
**description:** SQLite on device via Drizzle. Append-only entries with UUID, profile_id, updated_at, soft delete.
**date_implemented:** —
**depends_on:** —
**blocked_by:** —

### Category system
**status:** planned
**description:** Eight opinionated starter categories with colour and icon, plus custom categories, reorder, pin and archive.
**date_implemented:** —
**depends_on:** Local ledger database
**blocked_by:** —

### Profile switching
**status:** planned
**description:** Switch between personal and business. Every entry carries a profile_id and totals never mix across profiles.
**date_implemented:** —
**depends_on:** Local ledger database
**blocked_by:** —

### Entry edit, delete and undo
**status:** planned
**description:** Undo snackbar straight after save, plus full edit and soft delete from the entry list.
**date_implemented:** —
**depends_on:** Quick expense entry
**blocked_by:** —

### Income logging
**status:** planned
**description:** Log money in — salary, refunds, gifts — as a distinct entry type that offsets spending.
**date_implemented:** —
**depends_on:** Local ledger database
**blocked_by:** —

### Month overview
**status:** planned
**description:** Landing screen showing spent, left to spend, daily allowance for the remaining days, and today's entries.
**date_implemented:** —
**depends_on:** Local ledger database
**blocked_by:** —

### Category breakdown
**status:** planned
**description:** Horizontal bars per category for the selected month, with amounts and share of total.
**date_implemented:** —
**depends_on:** Category system
**blocked_by:** —

### Danish locale and currency formatting
**status:** planned
**description:** DKK formatting as 1.234,50 kr., Monday-first weeks, Europe/Copenhagen dates throughout.
**date_implemented:** —
**depends_on:** —
**blocked_by:** —

### CSV and Excel export
**status:** planned
**description:** Export any date range per profile, so the data is never trapped in the app.
**date_implemented:** —
**depends_on:** Local ledger database
**blocked_by:** —

---

## Phase 2 — Planning and reach

### Scheduled and recurring items
**status:** planned
**description:** Recurring rules with amount, cycle and next due date that auto-post rather than being logged by hand.
**date_implemented:** —
**depends_on:** Local ledger database
**blocked_by:** —

### Subscription overview
**status:** planned
**description:** All subscriptions in one list with a single total monthly burn figure. Yearly costs normalised to a monthly equivalent.
**date_implemented:** —
**depends_on:** Scheduled and recurring items
**blocked_by:** —

### Calendar month view
**status:** planned
**description:** Month grid marking the dates money comes in and goes out, with the selected day's items listed beneath.
**date_implemented:** —
**depends_on:** Scheduled and recurring items
**blocked_by:** —

### Forward balance projection
**status:** planned
**description:** Projects balance forward from a manually set balance anchor using scheduled items and average variable spend. Answers "how much will I have on the 20th?"
**date_implemented:** —
**depends_on:** Calendar month view, Balance anchor
**blocked_by:** —

### Balance anchor
**status:** planned
**description:** A single current-balance figure the user updates when convenient. All projections run from it, and re-anchoring corrects accumulated drift.
**date_implemented:** —
**depends_on:** Local ledger database
**blocked_by:** —

### Monthly budget
**status:** planned
**description:** Per-category and overall budgets covering variable spending only. Fixed bills are handled by projection, not by budget.
**date_implemented:** —
**depends_on:** Category system
**blocked_by:** —

### Android home screen widget
**status:** planned
**description:** Home screen widget with one-tap presets, a quick-add button, and left-to-spend at a glance.
**date_implemented:** —
**depends_on:** Quick expense entry
**blocked_by:** Widget feasibility spike

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
