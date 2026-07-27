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

### 2026-07-27 — MVP built and running
**agent:** Claude Code
**summary:**
The project had no package.json at all, so `expo start` failed immediately. Scaffolded
from Expo's own generator to get guaranteed-correct SDK 57 versions rather than
hand-written ones, then built the MVP.

Shipped and verified running in the browser: the amount-first numpad with optional
decimals, eight seeded but fully editable categories, income and expense entries, soft
delete, the month overview with budget pacing, the insights breakdown with
month-over-month comparison, category management, and a budget setting.

Layers are db/ (only SQL), lib/ (pure functions, tested), state/ (React binding), app/
(screens only). 28 unit tests over money formatting, the numpad state machine and month
aggregation. Typecheck clean.

Decisions taken this session, recorded in WORKING_NOTES:
- Raw SQL with a user_version migration runner instead of Drizzle — the query surface is
  too small to justify the build configuration.
- Money is integer øre everywhere, with hand-rolled formatting so output is identical on
  web, on device and in tests.
- The business profile was dropped entirely at the user's suggestion, since a convenient
  second ledger risks becoming a habit that bypasses Dinero and Skat.
- Category removal archives rather than deletes, so past months never change retroactively.
- Category is optional when logging — two taps beats three, and an uncategorised entry
  beats an unlogged one.
**issues:**
Verified the full save flow by driving the DOM, since the browser pane could not
composite frames for screenshots. That surfaced a real bug: opening /add as the first
route left `router.back()` with no history to pop, so the save button stuck on "Saving…"
— which is exactly how the widget will launch the screen. Fixed with a canGoBack check
falling back to the overview.

Also fixed: a deprecated shadow style prop, and a TabBar type that pulled in
@react-navigation/bottom-tabs without it being a direct dependency.

The FAB overlap the user spotted in the mockups is handled properly in the real app — the
button overlaps only the tab bar, and every scrolling screen pads its content by
SCROLL_BOTTOM_INSET so nothing is ever hidden underneath it.
**next_steps:**
Widget spike — it needs an Expo login so it cannot be run unattended, and this machine has
no JDK or Android SDK so it has to be a cloud build. Steps are in docs/widget-spike.md.
After that, use the app for a week; everything else in the backlog is a guess until real
use says what actually hurts.

### 2026-07-27 — Launchpad onboarding
**agent:** Claude Code
**summary:**
Launchpad held nothing for this project beyond its name and path — no description, tags,
tasks, ideas or notes. Filled it from the existing ai-instructions files: a real
description, seven tags, 11 open tasks plus 5 done ones, 15 ideas and 14 notes. `launchpad
audit` now reports nothing missing.

Everything pushed is grounded in what the repo already says. The three rejected features
were deliberately not pushed as ideas — that is precisely how a rejected feature gets
re-proposed — and live in a pinned note instead, alongside pinned notes for the
five-second capture constraint and the unvalidated widget bet.

Claimed 8081 as the project's dev-server port, detected from .claude/launch.json rather
than picked. Committed and pushed the previous session's uncommitted work (expo-dev-client
plus the EAS project id in app.json), the Launchpad binding files, and a gitignore rule for
the snapshot cache that `launchpad pull` regenerates on every run.
**issues:**
The ports API returned 404 on every call at the start of the session — it was still being
built — and `launchpad set port` additionally crashed the CLI with a libuv assertion. Both
worked on retry later in the session.

app.json now carries an EAS project id and expo-dev-client is a direct dependency, neither
of which was committed by the previous session. Creating an EAS project requires being
logged in, so the widget spike is probably further along than TASKS.md claims. Worth
confirming before anyone repeats the setup steps.

TASKS.md, FUTURE_IDEAS.md and WORKING_NOTES.md now duplicate what Launchpad holds, and
Launchpad is the source of truth. They will drift. Not resolved this session.
**next_steps:**
Run the widget build if the EAS login is in fact done — it is the one result that could
still invalidate the framework choice. Then decide what the markdown trackers are for now
that Launchpad owns the board: either they become the long-form detail Launchpad links to,
or they go.

### 2026-07-28 — Get it onto the phone
**agent:** Claude Code
**summary:**
The EAS development build had actually succeeded. The `spawn adb ENOENT` failure came
only from answering yes to "install and run on an emulator", which needs a local Android
SDK — installing to a real phone over the web link needs nothing on the PC at all.

The more useful correction: a development build contains no JavaScript. It fetches code
from Metro over the LAN, so it is useless without the PC running. For a week of real
expense logging the right artifact is a standalone release APK, so a `preview` build was
started. Both builds share the package name dk.mikkelblom.financetracker and will collide
if installed together.

Installed Android platform-tools via winget from Google's own server, giving adb and
fastboot. Not required for anything current, but `adb logcat *:E` is how a crash on the
phone gets diagnosed.

De-risked the one completely untested path. Everything until now ran in the browser on the
localStorage driver, so the expo-sqlite code had never executed. Extracted the shipped SQL
straight from db/migrations.ts and ran it against a real SQLite engine along with both
upserts, the soft delete and the settings write — all correct, and re-running the
migrations is properly idempotent. What remains unverified is expo-sqlite's own binding.

Wrote docs/run-on-phone.md covering install, the difference between the two builds, when a
rebuild is actually needed, and the firewall prompt that catches the dev-server path.
**issues:**
The Launchpad service was not reachable on localhost:7420, so none of this session's task
changes reached it — they exist only in TASKS.md. Logged as a task to re-sync.

Free-tier EAS queue time ran to roughly 90 minutes on the previous build, far longer than
the 16 minutes of actual build time. Worth knowing before planning around a rebuild.

The SQLite path is still unproven on device, and first launch is the test. That is the one
thing that could make tomorrow morning not work.
**next_steps:**
Install the preview APK and use the app. If it launches, the MVP is real and a week of
logging is the next input. If it crashes on launch, it is almost certainly expo-sqlite
initialisation — `adb logcat *:E`. Then the widget spike, which remains the open question
the framework choice rests on.
