# Google Play Release Kit

This folder contains the release-prep assets and copy needed for the first Google Play submission of `Omni247`.

## Included

- `store-listing.md`: ready-to-paste Play Store title, short description, full description, and release notes.
- `screenshot-plan.md`: the exact screenshots to capture from the emulator or a physical device.
- `data-safety-notes.md`: the Play Console declarations you should complete based on the current codebase.
- `feature-graphic.svg`: source artwork for the Play feature graphic at `1024x500`.

## Important before upload

1. Build and upload an Android App Bundle (`.aab`), not the debug APK.
2. Capture raw app screenshots only.
   Do not use screenshots that show the desktop, emulator frame, or IDE.
3. Use the account deletion web page in Play Console:
   `https://omni-247.com/account-deletion`
4. Use the privacy policy URL in Play Console:
   `https://omni-247.com/privacy`
5. Because the app supports user-uploaded reports and media, make sure your moderation and reporting flow is available in the production build.

## Remaining manual assets

- At least 2 phone screenshots are required to publish.
- A 512x512 Play Store icon is required.
  Use the existing logo as the base, but export it as a Play-compliant `32-bit PNG`.
- Export `feature-graphic.svg` to a `1024x500` PNG or JPEG before upload.
