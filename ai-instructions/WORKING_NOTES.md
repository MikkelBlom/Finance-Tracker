# Working Notes — Finance Tracker

Architectural concerns, decisions, open questions.
**Format rules (required for Launchpad parser):**
- Each note is a `### Note Title` heading
- Status must be exactly: `open` | `investigating` | `resolved`
- For multiline fields (details, reasoning), content follows on the next lines until the next `**field:**` or `###`

---

## Architecture

### Expo over Next.js for the phone app
**status:** resolved
**category:** Architecture
**details:**
The original scaffold specified Next.js for an Android and web deployment. That cannot
deliver an Android home screen widget — widgets are native RemoteViews and an installed
PWA gets a launcher icon and shortcuts, nothing more. The app is now Expo / React Native
with Next.js kept only for the PC web app and the sync API.
**reasoning:** The widget is close to the core value proposition, since it is the shortest possible path from intent to logged expense. Expo keeps the work in TypeScript and React, which is the closest thing to the original stack that can still ship a widget. Flutter was the alternative and has a more mature widget story, but costs a new language.
**resolved_date:** 2026-07-27

### Phone is local-first, PC is a thin client
**status:** resolved
**category:** Architecture
**details:**
The phone holds a full SQLite database and works with no network at all. The PC web app
talks to the sync API directly and holds no local database of its own.
**reasoning:** Only one sync engine has to be written and tested instead of two. The requirement is that the phone always works offline; the PC is realistically always online when it is in use. A local WASM SQLite store in the browser can be added later if the PC ever needs to work offline, without changing the phone side.
**resolved_date:** 2026-07-27

### Sync model — append-only ledger, last-write-wins
**status:** resolved
**category:** Architecture
**details:**
Every row carries a client-generated UUID, an updated_at timestamp and a deleted_at soft
delete. Sync pushes rows newer than the last watermark and pulls the same in reverse.
Conflicts resolve by newest updated_at and are written to a visible conflict log.
**reasoning:** There is exactly one user with at most two devices, so the hard part of sync — concurrent edits by different people — does not exist. CRDTs or an operational transform would be significant complexity bought for a problem this project does not have. Soft deletes matter because a hard-deleted row cannot be distinguished from a row the other device has not seen yet.
**resolved_date:** 2026-07-27

### Encryption deferred but designed for
**status:** open
**category:** Security
**details:**
End-to-end encryption is wanted but adds real complexity, especially for a browser client
that needs the key in memory. Decision for v1: TLS in transit, encryption at rest on the
server, strong auth — and the sensitive fields (amount, note, merchant) stored in a single
payload column rather than as separate typed columns.
Swapping that column from plaintext JSON to a ciphertext blob then requires no schema
migration, because every query that filters or aggregates on those fields runs locally on
the phone anyway.
**reasoning:** Shipping the habit-forming part matters more than perfect crypto on day one, but a data model that forecloses encryption would be an expensive mistake later. This buys the option cheaply.
**resolved_date:** —

---

## Product

### Budget covers variable spending only
**status:** resolved
**category:** Product
**details:**
Rent, insurance and subscriptions are not part of the monthly budget figure. They are
scheduled items handled by the calendar and the forward projection. The budget applies
only to discretionary and variable spending.
**reasoning:** Mixing them makes the budget number meaningless — a 10.000 kr. budget that is 75% consumed by rent on the first of the month tells the user nothing actionable. Separating them means "left to spend" is a number that can actually change behaviour today.
**resolved_date:** 2026-07-27

### Forward projection needs a manual balance anchor
**status:** open
**category:** Product
**details:**
"How much will I have on the 20th?" requires knowing the balance now, and with no bank
feed available the user has to type it in. Proposal: one balance figure, updated whenever
convenient, with everything projecting from it. Re-anchoring corrects any accumulated
drift, so the cost of it being stale is bounded.
Open question: how often to nudge for a re-anchor without it becoming another chore.
Weekly feels right; worth testing.
**reasoning:** The alternative — deriving balance purely from logged entries — compounds every missed entry into a permanently wrong number, which would poison the one feature meant to make the budget stick.
**resolved_date:** —

### Business profile does not replace Dinero
**status:** open
**category:** Product
**details:**
The business profile is a capture convenience for expenses incurred away from the desk.
Dinero remains the source of truth for the business books. Two systems holding the same
figures will drift, so the app should make the handoff explicit — a per-profile export
sized to what actually gets entered into Dinero — rather than pretending to be a ledger
for the business.
**reasoning:** Duplicate bookkeeping is a genuine accounting risk, not just untidiness. Naming the app as the capture side and Dinero as the record side avoids ever having to reconcile the two.
**resolved_date:** —

### Notification capture is additive, never the only path
**status:** resolved
**category:** Product
**details:**
Google Wallet covers most in-person payments and MobilePay may or may not emit a usable
notification. Online card payments, bills and account transfers produce nothing at all.
Captured notifications land in a pending inbox for one-tap confirmation; manual entry
stays the primary, always-available path.
**reasoning:** Designing the app around notification capture would silently lose whole classes of spending — exactly the invisible spending the app exists to make visible.
**resolved_date:** 2026-07-27

### Rejected features and why
**status:** resolved
**category:** Product
**details:**
Voice entry — the user will not use it, under any circumstances. Do not reintroduce it in
any form, including Assistant-triggered logging.
Time-of-day category suggestions — the user's schedule is irregular enough (dinner at 07:00
is normal) that the guess would be wrong more often than right, and a wrong default is
worse than no default.
Bank feed via open banking — checked and unavailable for this bank and country.
**reasoning:** Recorded here so these do not get re-proposed in a later session.
**resolved_date:** 2026-07-27

---

## Open Questions

### Which screen the app opens to
**status:** investigating
**category:** Design
**details:**
Opening straight to the numpad is fastest to log. Opening to the overview puts the budget
in front of the user on every launch, which is the stated reason previous budgets failed —
they were out of sight.
Current proposal: the app icon opens the overview, the widget opens the numpad directly,
and a setting overrides the default. That keeps the fast path fast without making the
budget something the user has to go looking for.
**reasoning:** Needs real-world use to settle. Worth revisiting after two weeks of daily use.
**resolved_date:** —

### Widget capability is unvalidated
**status:** investigating
**category:** Tech Debt
**details:**
The Expo recommendation rests on being able to ship an Android App Widget from a dev
build via a native module. This has not been proven on this machine or this device, and
the relevant libraries move fast enough that documentation may be stale.
Nothing substantial should be built until the spike passes.
**reasoning:** It is the one assumption that, if wrong, invalidates the framework choice — so it should be tested first and cheaply.
**resolved_date:** —
