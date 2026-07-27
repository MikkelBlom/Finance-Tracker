# Tasks — Finance Tracker

Active work items. This file drives the Kanban board in Launchpad.
**Format rules (required for Launchpad parser):**
- Each task is a `### Task Title` heading
- Fields use `**field_name:** value` syntax — bold key, plain value, same line
- Status must be exactly: `todo` | `in-progress` | `done`
- Priority must be exactly: `high` | `medium` | `low`

---

## Now

### Widget feasibility spike
**status:** in-progress
**priority:** high
**description:** Half proven. The EAS cloud pipeline works — a development APK built and downloaded successfully, so the machine needs no JDK or Android SDK. The actual question is still open: whether an Android App Widget can be registered and appear in the launcher's widget list from an Expo build. Add the widget library, register a trivial widget, rebuild once, and try to drop it on the home screen. Nothing else should be built on top of the Expo bet until that passes.
**created:** 2026-07-27

### Use it for a week and report what hurts
**status:** todo
**priority:** high
**description:** Install the standalone preview APK from https://expo.dev/accounts/mikkelr/projects/finance-tracker/builds — see docs/run-on-phone.md. The only useful next input is real use: which taps feel slow, which categories are wrong, whether the budget number changes any behaviour. Everything in the backlog is a guess until then.
**created:** 2026-07-27

### Confirm SQLite works on the device
**status:** todo
**priority:** high
**description:** Everything so far ran in the browser, which uses the localStorage driver — the expo-sqlite path has never executed. The SQL itself is verified against a real SQLite engine (migrations, upserts, soft delete, idempotent re-run all pass); what is unverified is expo-sqlite's binding and reading PRAGMA user_version back through getFirstAsync. First launch on the phone is the test. If it dies, `adb logcat *:E` will show why.
**created:** 2026-07-28

### Re-sync Launchpad
**status:** todo
**priority:** low
**description:** The Launchpad service was not running at the end of the 28 Jul session, so the build progress, the new SQLite verification task and the widget spike status change exist only in these markdown files. Push them when Launchpad is next up.
**created:** 2026-07-28

### Edit an existing entry
**status:** todo
**priority:** medium
**description:** Delete works; editing does not. Tapping an entry should open the numpad pre-filled so a wrong amount or category can be corrected instead of deleted and re-entered.
**created:** 2026-07-27

### Undo after save
**status:** todo
**priority:** medium
**description:** A brief undo affordance straight after saving, so a mistyped amount does not mean navigating to the list to fix it.
**created:** 2026-07-27

---

## Backlog

### Scheduled items and the calendar screen
**status:** todo
**priority:** high
**description:** Recurring rules that auto-post on their date, a month grid marking money in and out, and the subscription total. The calendar tab is currently an honest placeholder.
**created:** 2026-07-27

### Balance anchor and forward projection
**status:** todo
**priority:** high
**description:** A manually entered current balance plus scheduled items, giving "how much will I have on the 20th". Depends on scheduled items existing first.
**created:** 2026-07-27

### Notification listener spike
**status:** todo
**priority:** medium
**description:** Prove an Android NotificationListenerService is reachable from Expo via a config plugin, and capture the actual payload shapes Google Wallet and MobilePay produce on the S24 Ultra. Parsing cannot be designed before those strings are known.
**created:** 2026-07-27

### Sync API and Postgres schema
**status:** todo
**priority:** medium
**description:** Next.js route handlers for push and pull, single-user auth, last-write-wins on updated_at, and a conflict log.
**created:** 2026-07-27

### Replace the web localStorage driver
**status:** todo
**priority:** low
**description:** The browser preview persists to localStorage because expo-sqlite on web needs a WASM build and COOP/COEP headers. Fine while the browser is only a preview; revisit when the real PC client is built, which will talk to the sync API instead.
**created:** 2026-07-27

### CSV export
**status:** todo
**priority:** medium
**description:** Get the data out of the app. Matters more than it looks — it is the guarantee that nothing is trapped if the project stalls.
**created:** 2026-07-27

---

## Done

### Scaffold the Expo app
**status:** done
**priority:** high
**description:** Expo SDK 57 with expo-router, the db/lib/state/app layer split, SQLite on device and a localStorage driver for the browser preview, design tokens from the approved concepts, jest with 28 passing tests over the pure logic.
**created:** 2026-07-27

### Design the ledger schema
**status:** done
**priority:** high
**description:** categories, entries and settings, with UUID keys, updated_at, soft deletes and a user_version migration runner. Money stored as integer øre.
**created:** 2026-07-27

### Build the add-expense screen
**status:** done
**priority:** high
**description:** Amount-first numpad with optional decimals, category chips on the same screen, optional note, today/yesterday toggle, expense/income switch. Three taps from open to saved.
**created:** 2026-07-27

### Set up the browser preview loop
**status:** done
**priority:** medium
**description:** npx expo start --web serves at localhost:8081 with fast refresh, and .claude/launch.json lets the preview be driven directly during sessions.
**created:** 2026-07-27

### Seed the starter categories
**status:** done
**priority:** low
**description:** Eight categories seeded on first run with the colours from the design concepts, fully editable afterwards.
**created:** 2026-07-27
