# Wedding-day components

Photobooth flow: Supabase-backed email lookup / same-day signup → camera capture → reveal-gated gallery.

After reveal, guests can browse per-guest thumbnail strips, open a full-size lightbox, and download photos.

## How guests reach it

QR codes should point at **`/`**. [`getWeddingMode()`](../../lib/wedding-mode.ts) decides the experience:

- `pre-wedding` → invitation / RSVP site
- `wedding-day` → photobooth flow

In local dev, force mode with `WEDDING_MODE=wedding-day` or `pre-wedding` in `.env.local` (ignored in production builds).

## Routes

- `/` — mode-gated entry (QR target)
- `/wedding-day` — redirects to `/` (legacy alias)
- `/admin` — Supabase Auth-protected RSVP CRUD and coordinator controls

## Persistence

- RSVP lookup and same-day guest registration use server-only Supabase operations.
- [`storage.ts`](./storage.ts) still keeps photobooth sessions, photos, and gallery reveal state in localStorage. Photo persistence and the photo cap remain browser-local.

## localStorage keys

| Key                           | Purpose                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `wedding:wd-session`          | Matched guest session `{ guestId, email }`                                        |
| `wedding:wd-photos:{guestId}` | Photo records `{ dataUrl, capturedAt }` (max 10; legacy string arrays still read) |
| `wedding:gallery-revealed`    | Global gallery reveal flag                                                        |

Keep pre-wedding invitation/RSVP code out of this folder.
