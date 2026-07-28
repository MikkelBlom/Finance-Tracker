# Getting the app onto the phone

## The short version

Open these on the **S24 Ultra** (not the PC). Android will warn about installing outside
the Play Store; allow it for Chrome when asked. The app then runs on its own — no PC, no
dev server, no Wi-Fi.

**1. Install this first** — everything except the widget, and the safety net if anything
goes wrong:

https://expo.dev/artifacts/eas/zaSA7Lrca7GhQS8loXcXEJlUyDoNwlE1HP1XspbgdYI.apk

**2. Then this, once the first one has proved itself** — same app plus the home screen
widget:

https://expo.dev/artifacts/eas/Or7MucV_p6O_hjaDaBfbQMmLJ301nKhojdVUWkvzoP4.apk

The order matters because the widget build changes the app's entry point, which is startup
code. If it misbehaves, install the first APK **over** it — do not uninstall, or the
ledger goes with it.

Both direct links **expire on 11 August 2026**. After that, or for any later build, go to
the project's build list and tap the newest **preview** entry:

**https://expo.dev/accounts/mikkelr/projects/finance-tracker/builds**

## Adding the widget to the home screen

Long-press an empty part of the home screen → **Widgets** → find **Finance Tracker** →
drag **Log expense** where you want it. Tapping it opens straight into the numpad.

## Two builds, and why the difference matters

**preview** — a standalone release APK with the JavaScript baked in. Install it and use
it. This is the one for logging real expenses over the next week. It does not update when
code changes; a new build is needed for that.

**development** — the one built first. It contains no JavaScript. It fetches the code from
Metro running on the PC, so it shows a "could not connect" screen unless the PC is on,
`npx expo start --dev-client` is running, and both devices are on the same Wi-Fi. It
exists for fast iteration, not for daily use.

If both are installed they'll collide — same package name, `dk.mikkelblom.financetracker`.
Keep the preview one for real use, and install the dev build only while actively working
on the app.

## Iterating on the code later

```bash
npx expo start --dev-client
```

Then open the **development** build on the phone. It picks up code changes on save. The
first time Metro starts, Windows will pop a firewall prompt for Node — allow it on private
networks or the phone won't reach the PC.

This PC's addresses are `192.168.0.109` (Wi-Fi) and `192.168.0.105` (Ethernet). If the
phone can't find the dev server, `npx expo start --dev-client --tunnel` routes around the
network entirely, more slowly.

Rebuilding is only needed when native code changes — adding a native module, changing
`app.json` plugins, or the widget work. Ordinary screen and logic changes do not need one.

```bash
npx eas-cli build --profile preview --platform android
```

Builds take 15–20 minutes plus queue time, which on the free tier ran to about 90 minutes.

## adb

Installed via winget (`Google.PlatformTools`, from Google's own server). It was never
actually required — that `spawn adb ENOENT` error only appeared because the CLI was asked
to install to an **emulator**, which needs a local Android SDK. Installing to a real phone
over the web link needs nothing on the PC.

It's useful now for:

```bash
adb devices
```

```bash
adb logcat *:E
```

The second one is how to see why the app crashed, if it does. It needs USB debugging
enabled on the phone: Settings → About phone → tap Build number seven times, then
Developer options → USB debugging.

## What has not been tested on a real device

Everything so far ran in the browser, which uses a localStorage driver. **The SQLite code
path has never executed.** The SQL itself is verified — every migration statement, both
upserts, the soft delete and the settings write were run against a real SQLite engine and
behave correctly, including re-running migrations as a no-op. What is unverified is
`expo-sqlite`'s binding: opening the database, and reading `PRAGMA user_version` back
through `getFirstAsync`.

If the app dies on launch, that's the first place to look, and `adb logcat *:E` will show
it. Everything else — the numpad, the money maths, the month aggregation — is covered by
tests that pass and is platform-independent.
