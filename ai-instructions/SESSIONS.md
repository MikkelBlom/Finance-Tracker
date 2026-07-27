# Sessions — Finance Tracker

Chronological session log. Append entries — never edit previous ones.
**Format rules (required for Launchpad parser):**
- Each session is a `### YYYY-MM-DD — Session Title` heading
- Agent examples: `Claude Code` | `Claude (Cowork)` | `Cursor` | `Manual`

---

### 2026-04-17 — Project created
**agent:** Claude (Cowork)
**summary:**
Project scaffolded by Launchpad. Initial ai-instructions setup complete.
**issues:** —
**next_steps:** Define initial tasks in TASKS.md and start building.

### 2026-07-27 — Idea recovered, stack decided, first design concepts
**agent:** Claude Code
**summary:**
The scaffold was found completely unfilled — every file still held its template placeholder
and PROJECT_CLAUDE.md still contained the literal {{PROJECT_DESCRIPTION}} token. The only
surviving information was the project name and the Launchpad stack answers. The idea was
recovered from the user directly rather than from any file.

Product defined: a phone-first personal expense tracker whose entire purpose is making
capture fast enough that the habit survives. Roughly 70% logging, 30% forward-looking
month view. Business finances stay in Dinero.

Decisions made and recorded in WORKING_NOTES:
- Stack changed from Next.js to Expo / React Native for the phone, because an Android home
  screen widget cannot be delivered by a PWA. Next.js retained for the PC app and sync API.
- Phone is local-first SQLite; PC is a thin online client. One sync engine instead of two.
- Sync is append-only with last-write-wins, which is sufficient for one user and two devices.
- Budget covers variable spending only; fixed bills are handled by the calendar projection.
- Encryption deferred but designed for, via a single payload column that can become a
  ciphertext blob with no schema migration.

Features rejected and recorded so they are not re-proposed: voice entry, time-of-day
category guessing, and any open-banking bank feed (unavailable for this bank and country).

Wrote all seven ai-instructions files with real content, and produced six light-mode screen
concepts as a reviewable HTML document — overview, add expense, calendar and projection,
insights, subscriptions, and the notification confirm inbox.
**issues:**
The Browser pane could not composite frames, so the design was verified by measuring the DOM
instead of by screenshot. That caught the add-expense screen clipping its Save button below
the fold — fixed — and a scroll-fade floating 19px above the tab bar — fixed. Mobile-width
rendering could not be verified locally; the published artifact is the way to check it on the
actual device.
**next_steps:**
Run the widget feasibility spike before writing any real code, since the whole framework
choice rests on it. Then scaffold the Expo app and build the add-expense screen first.
