# Play Console Data Safety Notes

Based on the current app code and manifest, these are the main declarations to review in Play Console.

## Data types likely collected

- Personal info:
  name, email address, phone number
- Location:
  precise location for map-based incident reporting
- Photos and videos:
  user-submitted report media
- Audio:
  may be included when users record video evidence
- App activity / interactions:
  report creation, alerts, privacy settings, notification interactions

## Key policy URLs

- Privacy policy:
  `https://omni-247.com/privacy`
- Account deletion:
  `https://omni-247.com/account-deletion`

## Permissions currently declared

- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `CAMERA`
- `RECORD_AUDIO`
- `READ_MEDIA_IMAGES`
- `READ_MEDIA_VIDEO`
- `READ_MEDIA_AUDIO`
- `POST_NOTIFICATIONS`

## Permissions removed for Play simplicity

`ACCESS_BACKGROUND_LOCATION` has been removed from the Android manifest because the current app flow only uses foreground location.

## App Content items to complete

- Privacy policy: required
- Data safety: required
- Account deletion: required because the app supports account creation
- Ads: mark `No` unless you actively serve ads in the mobile app
- Target audience: choose the real age group; do not select children unless that is intentional
- News app declaration: likely `No` unless your core store positioning is news publishing
- Government app declaration: `No` unless this app is officially operated by a government entity

## UGC review note

Omni247 allows users to submit reports and media that may be visible to others. In Play policy terms, that is user-generated content. Make sure the production app has:

- a way to report objectionable content
- moderation or review workflow
- a privacy policy and user rules that describe acceptable use
