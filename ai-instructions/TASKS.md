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
**status:** todo
**priority:** high
**description:** Build a throwaway Expo dev build with a hello-world Android home screen widget on the S24 Ultra. This validates the entire stack choice — if a widget cannot be shipped from Expo, the framework decision has to be revisited before any real code is written. Timebox to one session.
**created:** 2026-07-27

### Scaffold the Expo app
**status:** todo
**priority:** high
**description:** Expo + TypeScript project with the db/ lib/ app/ layer split, expo-sqlite and Drizzle wired up, Danish currency formatting helper, and light-mode design tokens from the approved concepts.
**created:** 2026-07-27

### Design the ledger schema
**status:** todo
**priority:** high
**description:** entries, categories, profiles, scheduled_items, budgets, balance_anchors. Every table gets a UUID primary key, updated_at and deleted_at. Sensitive fields go in a single payload column per the encryption-later decision in WORKING_NOTES.
**created:** 2026-07-27

### Build the add-expense screen
**status:** todo
**priority:** high
**description:** The whole product in one screen — amount-first numpad, category chips, save. Measure the tap count and the time to save, and treat anything over three taps as a bug.
**created:** 2026-07-27

### Set up the browser preview loop
**status:** todo
**priority:** medium
**description:** Confirm expo start --web renders the app in Chrome, add a custom S24 Ultra device profile in DevTools, and add .claude/launch.json so the preview can be driven directly during sessions.
**created:** 2026-07-27

---

## Backlog

### Notification listener spike
**status:** todo
**priority:** medium
**description:** Prove that an Android NotificationListenerService can be reached from Expo via a config plugin, and capture the actual notification payload shapes that Google Wallet and MobilePay produce on the S24 Ultra. Parsing cannot be designed before those strings are known.
**created:** 2026-07-27

### Decide the app's opening screen
**status:** todo
**priority:** medium
**description:** Overview first teaches the budget on every launch; numpad first is faster to log. Current proposal is overview from the app icon, numpad from the widget, with a setting to override. Needs a real-use verdict after a couple of weeks.
**created:** 2026-07-27

### Sync API and Postgres schema
**status:** todo
**priority:** medium
**description:** Next.js route handlers for push and pull, single-user auth, last-write-wins on updated_at, and a conflict log.
**created:** 2026-07-27

### Seed the starter categories
**status:** todo
**priority:** low
**description:** Groceries, Eating out, Transport, Home and bills, Subscriptions, Fun, Health, Other — with the colours from the design concepts.
**created:** 2026-07-27
