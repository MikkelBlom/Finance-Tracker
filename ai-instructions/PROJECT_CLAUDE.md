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

**The one design constraint that outranks everything:** pocket to saved expense in under
five seconds and no more than three taps. Any feature that slows the capture path gets
moved off it.

---

## 2. Tech Stack

- **Phone (primary):** Expo SDK 57 / React Native 0.86, TypeScript, expo-router
- **Local database:** SQLite via `expo-sqlite`, raw SQL behind a `Store` interface
- **Widget:** Android App Widget via a native module — requires an EAS dev build, not Expo Go
- **PC:** Next.js — web UI plus the sync API (not started)
- **Server database:** PostgreSQL (not started)
- **Locale:** Danish krone, `1.234,50 kr.` formatting, Europe/Copenhagen, Monday-first weeks

---

## 3. Key Constraints & Invariants

- **The phone works fully offline, always.** The network is never on the critical path for
  logging an expense.
- **Money is an integer number of øre.** Never a float, anywhere, at any layer.
- **The phone's SQLite database is the source of truth for the phone.** The server is a
  sync peer, not an authority.
- **Never store card numbers, bank credentials, or CPR numbers.** Not now, not later.
- **The ledger is append-only.** Soft-delete via `deletedAt`; never hard-delete a row that
  has already synced.
- Every row carries a client-generated UUID and an `updatedAt` — sync is last-write-wins.
- **Removing a category archives it.** Entries keep pointing at it so history and past
  totals never change retroactively.
- Transfers between own accounts will be a distinct entry type and must never count as
  spending.
- All schema changes ship as a new entry in `db/migrations.ts` — never edit an existing one.
- **Never commit `.env`, secrets, or a local database file.**

---

## 4. Architecture

Four layers, and code does not skip one:

1. **`db/`** — the only place that speaks SQL. Exposes a `Store` interface returning plain
   objects, so nothing above it knows or cares that SQLite exists.
2. **`lib/`** — pure functions: money formatting, date maths, the numpad state machine,
   month aggregation. No I/O, no React. This is what the tests cover.
3. **`state/`** — binds the store to React and holds the ledger in memory. Screens read
   from here and call its actions.
4. **`app/`** — expo-router screens. Presentation only: no SQL, no money arithmetic.

The whole ledger is loaded into memory. A few thousand rows over several years is nothing,
and it means every total is a pure function in `lib/` rather than a SQL query — far easier
to test and identical on every platform.

---

## 5. Critical Files

- `app/add.tsx` — the numpad. The whole product; treat regressions here as critical.
- `lib/amountInput.ts` — the numpad state machine. A bug here is a wrong number in the ledger.
- `lib/money.ts` — øre formatting. The only place money becomes a string.
- `lib/totals.ts` — all month aggregation and budget pacing.
- `db/migrations.ts` — append-only schema history.
- `db/sqliteStore.ts` — the only SQL in the codebase.
- `state/DataProvider.tsx` — every write goes through here.
- `theme/tokens.ts` — colours and spacing from the approved design. Screens must not
  hard-code hex values.
- `ai-instructions/docs/design/light-mode-concepts.html` — the approved design concepts.
- `ai-instructions/docs/widget-spike.md` — the unrun spike the stack choice depends on.

---

## 6. Known Limitations & Out of Scope

- **No bank feed.** Confirmed unavailable for this bank and country. Do not design around one.
- **No voice entry.** Explicitly rejected by the user — do not reintroduce it in any form.
- **No time-of-day category guessing.** The user's schedule is irregular enough that it
  would guess wrong more often than right.
- **No business profile.** Business bookkeeping lives in Dinero and Skat. A convenient
  second profile here would risk becoming a habit that bypasses them — deliberately dropped.
- Notification capture, when built, is a convenience layer and never the only capture path.
  Many payments (online card, bills, transfers) produce no notification at all.
- No multi-user or shared household mode.
- No investments, assets, or net worth tracking.
- No multi-currency beyond DKK.

---

## 7. Suggested Reading

- See `FEATURES.md` — what's implemented vs. planned
- See `TASKS.md` — current Kanban board
- See `WORKING_NOTES.md` — open architectural questions
- See `SESSIONS.md` — recent work history
