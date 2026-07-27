# CLAUDE.md — Finance Tracker

**Read the global CLAUDE.md first** (in this same folder), then read this to understand
what makes this specific project unique.

---

## 1. Project Summary

A personal expense tracker for a single user, built phone-first for Android with an
equal-peer web app for PC. The problem it solves is not analysis — it is **capture**.
Spreadsheets and receipt-hoarding fail because logging is tedious and the results are out
of sight, so the habit dies within a week or two.

Roughly 70% of the value is fast expense logging. The remaining 30% is a forward-looking
view of the month: scheduled bills, income dates, and "how much will I actually have on
the 20th?"

Business finances live in **Dinero** and stay there. A `business` profile exists in this
app only for capturing expenses on the go — it is never the source of truth for the
business books.

**The one design constraint that outranks everything:** pocket to saved expense in under
five seconds and no more than three taps. Any feature that slows the capture path gets
moved off it.

---

## 2. Tech Stack

- **Phone (primary):** Expo / React Native, TypeScript
- **Local database:** SQLite (`expo-sqlite`) via Drizzle ORM — source of truth on device
- **Widget:** Android App Widget via a native module — requires an EAS dev build, not Expo Go
- **PC:** Next.js (App Router) — web UI plus the sync API
- **Server database:** PostgreSQL
- **Locale:** Danish krone, `1.234,50 kr.` formatting, Europe/Copenhagen, Monday-first weeks

---

## 3. Key Constraints & Invariants

- **The phone works fully offline, always.** The network is never on the critical path for
  logging an expense.
- **The phone's SQLite database is the source of truth for the phone.** The server is a
  sync peer, not an authority.
- **Never store card numbers, bank credentials, or CPR numbers.** Not now, not later.
- Sensitive entry fields (amount, note, merchant) live in a single `payload` column so the
  server side can be swapped to ciphertext later without a schema migration.
- **The ledger is append-only.** Soft-delete via `deleted_at`; never hard-delete a row that
  has already synced.
- Every row carries a client-generated UUID and an `updated_at` — sync is last-write-wins.
- `profile_id` is mandatory on every entry. Personal and business totals never mix in any
  view, export, or total.
- Transfers between own accounts are a distinct entry type and never count as spending.
- All schema changes ship as a migration file.
- **Never commit `.env`, secrets, or a local database file.**

---

## 4. Architecture

Three layers, and code does not skip one:

1. **`db/`** — schema, migrations, typed queries. Nothing else touches SQLite directly.
2. **`lib/`** — business logic: balance projection, budget pacing, recurrence expansion,
   category rules, currency formatting. Pure functions, unit tested.
3. **`app/`** — screens and components. Presentation only: no SQL, no money arithmetic.

`sync/` is a separate module that reads and writes the ledger through `db/` like any other
consumer, so sync can be developed, tested, and disabled independently.

---

## 5. Critical Files

Nothing implemented yet — this section gets filled in as the scaffold lands.

- `ai-instructions/docs/design/light-mode-concepts.html` — current UI design concepts

---

## 6. Known Limitations & Out of Scope

- **No bank feed.** Confirmed unavailable for this bank and country. Do not design around one.
- **No voice entry.** Explicitly rejected by the user — do not reintroduce it.
- **No time-of-day category guessing.** The user's schedule is irregular enough that it
  would guess wrong more often than right.
- Notification capture is a convenience layer, never the only capture path. Many payments
  (online card, bills, account transfers) produce no notification at all.
- No multi-user or shared household mode.
- No investments, assets, or net worth tracking.
- No multi-currency beyond DKK.

---

## 7. Suggested Reading

- See `FEATURES.md` — what's implemented vs. planned
- See `TASKS.md` — current Kanban board
- See `WORKING_NOTES.md` — open architectural questions
- See `SESSIONS.md` — recent work history
