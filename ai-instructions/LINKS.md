# Links & Research — Finance Tracker

Research links, references, and resources for this project.
**Format rules (required for Launchpad parser):**
- Each link is a `### Link Title` heading
- Category examples: `Documentation` | `Reference` | `Tutorial` | `Tool` | `Inspiration` | `API`

---

## Framework

### Expo documentation
**url:** https://docs.expo.dev
**category:** Documentation
**description:** Main reference for the phone app. Note the difference between Expo Go and a development build — anything with native code, including the widget, needs a dev build.
**added:** 2026-07-27

### expo-sqlite
**url:** https://docs.expo.dev/versions/latest/sdk/sqlite/
**category:** Documentation
**description:** Local database on device. Confirm the current web support story before relying on the browser preview for anything data-related.
**added:** 2026-07-27

### Drizzle ORM with Expo SQLite
**url:** https://orm.drizzle.team/docs/connect-expo-sqlite
**category:** Documentation
**description:** Typed queries and migrations over expo-sqlite. Chosen for migration support, since schema changes are a stated invariant.
**added:** 2026-07-27

---

## Android platform

### App Widgets overview
**url:** https://developer.android.com/develop/ui/views/appwidgets/overview
**category:** Reference
**description:** What an Android home screen widget actually is at the platform level. Useful for understanding what the React Native wrapper can and cannot express.
**added:** 2026-07-27

### NotificationListenerService
**url:** https://developer.android.com/reference/android/service/notification/NotificationListenerService
**category:** Reference
**description:** The mechanism behind notification capture of Google Wallet and MobilePay payments. Sensitive permission, and Play Store distribution restricts it — fine for a sideloaded personal app.
**added:** 2026-07-27

### ML Kit text recognition
**url:** https://developers.google.com/ml-kit/vision/text-recognition/v2
**category:** API
**description:** On-device, offline OCR for receipt autofill. No cloud call, so no receipt images leave the phone.
**added:** 2026-07-27

---

## Reference

### Dinero
**url:** https://dinero.dk
**category:** Reference
**description:** Where the business books actually live. This app never becomes the source of truth for business finances — see WORKING_NOTES.
**added:** 2026-07-27
