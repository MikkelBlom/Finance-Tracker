# Widget feasibility spike

**Status:** ready to run — needs your Expo account, so it can't be run for you.

## Why this matters

The whole framework choice rests on one unproven assumption: that an Android home
screen widget can be shipped from an Expo app. If it can't, Expo is the wrong tool and
we should find that out now, before there's a real app to port.

## Why it has to be a cloud build

This machine has no JDK and no Android SDK (checked: `java` not found, `ANDROID_HOME`
unset). A local `npx expo run:android` would mean installing Android Studio and a JDK
first — a couple of hours and several GB.

EAS builds in the cloud instead. It needs a free Expo account and no local Android
toolchain at all.

## Steps

Create a free account at https://expo.dev, then:

```bash
npx eas-cli login
```

```bash
npx eas-cli build --profile development --platform android
```

The build takes roughly 10–20 minutes. When it finishes you get a QR code and an APK
download link. Install that APK on the S24 Ultra.

From then on, this is your device loop — the APK only needs rebuilding when native code
changes, not when app code does:

```bash
npx expo start --dev-client
```

## What the spike actually proves

Installing the dev build proves the pipeline works. The widget itself is the next step:
add the widget library, register a trivial "Hello" widget, rebuild once, and try to drop
it on the home screen.

Three things to confirm, in order of how likely they are to bite:

1. **A widget appears in the launcher's widget list at all.** This is the pass/fail gate.
2. **Tapping it opens the app.** The add screen already handles being the first route
   with no history behind it, which is exactly how the widget will launch it.
3. **The widget can show a number that updates.** Needed for "left to spend" on the home
   screen. If only a static launcher works, the widget is still worth having — the value
   is mostly the one-tap path to logging.

## If it fails

Flutter is the fallback. Its `home_widget` package has a more mature story, at the cost
of learning Dart. Nothing built so far is wasted in that case except the screens
themselves: the schema, the money handling, the amount-input state machine and the
aggregation logic are all plain logic with tests, and port over directly.
