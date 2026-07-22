# Wedding-day components

Photobooth prototype (frontend-only): welcome gate → email lookup / same-day signup → camera capture → reveal-gated gallery.

After reveal, guests can browse per-guest thumbnail strips, open a full-size lightbox, and download photos.

## How guests reach it

QR codes should point at **`/`**. [`getWeddingMode()`](../../lib/wedding-mode.ts) decides the experience:

- `pre-wedding` → invitation / RSVP site
- `wedding-day` → photobooth flow

In local dev, force mode with `WEDDING_MODE=wedding-day` or `pre-wedding` in `.env.local` (ignored in production builds).

## Routes

- `/` — mode-gated entry (QR target)
- `/wedding-day` — redirects to `/` (legacy alias)
- `/admin` — coordinator reveal toggle (passcode: `reveal2027`)

## Swap-out points for a real backend

- [`mockGuests.ts`](./mockGuests.ts) — replace hardcoded guest list with API lookup
- [`storage.ts`](./storage.ts) — replace localStorage with server persistence; photo cap, same-day registration, and admin gate are **client-only placeholders** today

## localStorage keys

| Key | Purpose |
|-----|---------|
| `wedding:wd-session` | Matched guest session `{ guestId, email }` |
| `wedding:wd-photos:{guestId}` | Photo records `{ dataUrl, capturedAt }` (max 10; legacy string arrays still read) |
| `wedding:wd-local-guests` | Same-day walk-up registrations on this device |
| `wedding:gallery-revealed` | Global gallery reveal flag |
| `wedding:wd-admin-ok` | Client-side admin unlock marker |

Keep pre-wedding invitation/RSVP code out of this folder.
