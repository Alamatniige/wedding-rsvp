## Context (carry forward)
- Repo: `wedding-rsvp` (TanStack Start, already initialized — do not re-scaffold or install a conflicting router)
- No backend implementation yet — UI-first phase only. RSVP backend (Supabase) comes later, MUST NOT be implemented now
- All CSS MUST stay centralized in `src/styles.css` — no inline styles, no CSS modules, no Tailwind utility sprawl
- Animation split is LOCKED: GSAP + ScrollTrigger for all scroll/entrance/timeline animation, Framer Motion ONLY for modal/step/accordion transitions
- **Supersedes the previous photobooth-gate spec.** That version had a multi-frame photo strip and a broader tropical restyle across the whole site. The client has since given a more specific, simpler animation brief (below) — follow this version, not the prior one.
- **Scope this round is the entrance/welcome gate ONLY.** Do not touch `HeroSection.tsx`, `OurStory.tsx`, `Itinerary.tsx`, `TravelAccommodations.tsx`, `RSVPForm.tsx`, `Registry.tsx`, or `Footer.tsx`. Those are "the invitation" and will be adjusted in a later pass.
- Wedding metadata (real names, date) and real photo/asset files are not final — MUST use mock data and mock/placeholder images throughout. Client will supply the real photobooth-machine image and palm tree image later as a drop-in asset swap, not a rebuild.

---

## CLIENT BRIEF

Original direction (Taglish, kept verbatim for tone):
> "So i was thinking something like the photobooth for save the date but with palm trees and filipino vibes as the background maybe pero photo booth parin"

Refined animation brief (this round's source of truth):
1. On page load: greeting text "We are getting married!" appears, then the couple's names appear beneath it
2. A photobooth machine graphic appears, with a shutter / "click me" button
3. On click: a polaroid frame slowly slides/ejects out of the machine, revealing a couple photo
4. Underneath the photobooth: "Save the Date" text, followed by the wedding date
5. At the very bottom: a button reading something like "Open the Invitation" — this is the gate's exit action into the rest of the site
6. Fonts should be adjusted throughout the codebase to better complement the tropical/Filipino vibe — this is a global token change, not a per-component rewrite

---

## GOAL
Rebuild the entrance/welcome gate only — replacing `WelcomeGate.tsx` — as a `PhotoboothGate.tsx` that plays the sequence above, styled with a Filipino tropical art direction (palm trees, warm tones), using mock images for the photobooth machine, palm background, and couple photo. Update the site's font tokens globally to match the new direction. Leave every other section untouched for now.

---

## TECH STACK — LOCKED, DO NOT DEVIATE
- Framework: TanStack Start (already initialized)
- Animations: GSAP + ScrollTrigger (primary engine for the whole entrance timeline)
- Micro-interactions: Framer Motion (gate mount/unmount only, matching the old gate's `AnimatePresence` pattern)
- Styling: centralized in `src/styles.css`, CSS custom properties for every design token
- No new animation libraries

---

## FONT SYSTEM — UPDATE GLOBALLY

Keep the existing token **names** in `src/styles.css` so no component needs to change its CSS — only repoint the values and the Google Fonts import at the top of the file. If any component has a hardcoded `font-family` instead of a `var(--font-*)` token, fix it to use the token (this shouldn't exist per the CSS architecture rules, but audit for it).

Proposed pairing (warm, tropical, still legible as a wedding site — adjust if the client's reference images suggest otherwise once shared):

```css
--font-display: "Fraunces", Georgia, serif;       /* was Cormorant Garamond — couple names, headings: warmer/softer serif */
--font-subheading: "Fraunces", Georgia, serif;    /* was Cormorant SC — reuse Fraunces at a lighter weight instead of a second serif family */
--font-sans: "Poppins", ui-sans-serif, system-ui, sans-serif; /* was Jost — rounder, warmer, common in PH wedding branding */
--font-handwriting: "Caveat", "Segoe Script", cursive; /* unchanged — still useful for small handwritten accents */
--font-script: "Yellowtail", "Segoe Script", cursive;  /* was Ballet — playful brush script for "Save the Date" / greeting, less formal-bridal than Ballet */
```

- Add the corresponding `@import` or `<link>` for Fraunces, Poppins, and Yellowtail (Google Fonts) at the top of `styles.css`, alongside the existing Caveat import
- Apply `font-display: swap` to all custom font declarations
- This change is global and will visibly affect other sections even though we aren't editing their component files — that's expected and fine, it's a token-only change

---

## IMAGE ASSETS — MOCK NOW, REAL LATER

Create this folder and use these exact filenames so the client's real assets can be dropped in later without touching code:

```
public/
└── images/
    └── entrance/
        ├── photobooth-machine.png   ← mock now; client will replace with real photobooth photo
        ├── palm-background.png      ← mock now; client will replace with real palm tree image
        └── couple-photo.jpg         ← mock now; the "couple shot" revealed on the polaroid
```

- Reference these with root-relative paths in code, e.g. `/images/entrance/photobooth-machine.png` (matches the existing convention already used in this repo, e.g. `/dog.png` referenced directly from `public/`)
- For the mock images themselves, use a placeholder image service (e.g. `https://placehold.co/600x800?text=Photobooth+Machine`) saved into those exact file paths, OR reference the placeholder URL directly if you'd rather not save local files yet — either is fine as long as the file path/prop names above stay the same so swapping in real files later is a one-line change
- Do NOT hardcode these paths inside multiple components — pull them from `weddingData.ts` (see below) so there's a single source of truth for the path

---

## SECTION BUILD — `PhotoboothGate.tsx` (replaces `WelcomeGate.tsx`)

Same integration contract as the old gate: `{ onComplete: () => void }`, called when the gate finishes exiting, so `HeroSection`'s existing `gateOpen` handoff keeps working unchanged.

### Background
- Full-screen fixed overlay. Background uses `palm-background.png` (mock) — the client wants palm trees + Filipino/tropical vibes here, so treat this image as the scene's backdrop, not a decorative corner element
- A soft dark gradient/vignette overlay on top of the background image for text legibility (same technique the old gate used, just repoint the tokens to the new tropical palette below)

### Tropical palette (add to `:root`, alongside existing tokens — don't delete tokens other sections still use)
```css
--color-palm-deep: #1f3d2b;
--color-sunset-coral: #e8734a;
--color-sunset-gold: #f4b860;
--color-capiz: #fbf6ee;
```

### Stage 1 — Greeting + names
- "We are getting married!" fades/drifts in first (`opacity + translateY`, `power2.out`), using `--font-script` or `--font-display` italic
- Couple names fade in immediately after (staggered `+0.15–0.2s` in the same GSAP timeline), large `--font-display`

### Stage 2 — Photobooth machine
- `photobooth-machine.png` fades/scales in after the names settle
- A shutter/"click me" button is a real `<button>` positioned over the machine's shutter area (absolutely positioned against the image, or as an SVG/CSS circle if that reads better than a hotspot on the raster image — dev's call, keep it obviously clickable)
- Idle state: gentle pulse on the shutter button (`scale` 1 → 1.05, `sine.inOut`, `yoyo: true`, `repeat: -1`) so it reads as interactive
- Label near the button, e.g. "Tap to take our photo" (`--font-sans`, small, uppercase/letter-spaced)

### Stage 3 — Polaroid ejection (the click interaction)
- On click: kill the idle pulse tween
- A polaroid-framed `couple-photo.jpg` slides slowly out of the machine's print slot — animate `y` (or `y` + slight `rotate`, 2–4deg, for a tactile "sliding out crooked" feel) from behind/inside the machine graphic to its resting position below/in front of it
- Keep this slow and deliberate (roughly 1–1.4s, `power2.out`) — the client described it as "slowly goes out," so don't rush it
- Once resting, a subtle settle (`scale` 0.97 → 1, `back.out` with a small overshoot) sells the print landing in place

### Stage 4 — Save the date
- After the polaroid settles, fade in underneath the photobooth: "Save the Date" (`--font-script`), then the wedding date directly below it (`--font-sans`, letter-spaced, smaller)
- This is the same GSAP timeline continuing, not a new ScrollTrigger — everything in this gate is one entrance sequence, not scroll-driven

### Stage 5 — Exit CTA
- After the date text settles, fade in a button pinned near the bottom of the gate, e.g. "Open the Invitation"
- Clicking it fades/scales the whole gate out (`opacity: 0`, slight `scale` up, `pointer-events: none`) and calls `onComplete()` — same handoff pattern as the old gate
- Persist "seen" state in `sessionStorage` (new key, e.g. `wedding:photobooth-opened`) so returning visitors in the same session skip straight past the gate

### Carried-over requirements from the old gate
- MUST use `will-change: transform, opacity` on animated elements
- MUST clean up all GSAP tweens/timelines on unmount via the `useGSAP` hook
- MUST be keyboard-accessible: shutter button and "Open the Invitation" button are real `<button>`s with `aria-label`s and visible focus states

---

## DATA — extend `src/data/weddingData.ts`

Add this export (don't restructure existing exports):

```ts
export const entranceGate = {
  greeting: 'We are getting married!',
  saveTheDateLabel: 'Save the Date',
  photoboothMachineSrc: '/images/entrance/photobooth-machine.png',
  palmBackgroundSrc: '/images/entrance/palm-background.png',
  couplePhotoSrc: '/images/entrance/couple-photo.jpg',
  shutterPrompt: 'Tap to take our photo',
  exitCta: 'Open the Invitation',
}
```

- Reuse the existing `couple` export for names/date inside the gate — don't duplicate that data here

---

## ANIMATION SYSTEM RULES (unchanged, still enforced)
1. All scroll-driven animation uses GSAP ScrollTrigger — never a manual Intersection Observer (not that this gate scrolls, but this rule still applies site-wide)
2. Animate only `transform` and `opacity` — never `width`, `height`, `top`, `left`, `margin`, `padding`
3. Every GSAP context MUST be cleaned up via `useGSAP`
4. `will-change: transform` on any animated element
5. Framer Motion stays scoped to the gate's own mount/unmount `AnimatePresence` — the internal greeting → names → machine → polaroid → date → CTA sequence is one GSAP timeline, not Framer Motion steps

---

## CSS ARCHITECTURE RULES (unchanged)
1. Tokens live in `:root` at the top of `styles.css`
2. Component styles grouped by section with `/* === Section: Name === */` comments — replace the old `/* === Section: WelcomeGate === */` block with `/* === Section: PhotoboothGate === */`
3. Never use `!important`
4. Mobile-first, `min-width` breakpoints only

---

## PERFORMANCE CONSTRAINTS (unchanged)
- 60 FPS target on mid-range Android (Snapdragon 6xx equivalent)
- `markers: false` on all ScrollTrigger instances
- Images: `loading="lazy"` where not part of the critical entrance sequence, explicit `width`/`height`
- `font-display: swap` on all custom fonts

---

## DELIVERABLES — IN THIS ORDER
1. `src/styles.css` — new font imports + repointed `--font-*` values, new tropical color tokens, remove the dead `WelcomeGate`/gift-wrap CSS block, add the new `PhotoboothGate` block
2. `public/images/entrance/` — placeholder files (or documented placeholder URLs) for `photobooth-machine.png`, `palm-background.png`, `couple-photo.jpg`
3. `src/data/weddingData.ts` — add the `entranceGate` export
4. `src/components/sections/PhotoboothGate.tsx` — full build per the stage-by-stage spec above
5. `src/routes/index.tsx` — swap the import/usage from `WelcomeGate` to `PhotoboothGate`
6. Delete `WelcomeGate.tsx` only after `PhotoboothGate.tsx` is confirmed working

After completing each file output: ✅ [filename] — done

## STOP AND ASK BEFORE
- Deleting `WelcomeGate.tsx` (confirm the new gate works first)
- Touching any file inside `HeroSection.tsx`, `OurStory.tsx`, `Itinerary.tsx`, `TravelAccommodations.tsx`, `RSVPForm.tsx`, `Registry.tsx`, or `Footer.tsx` — out of scope this round
- Removing any CSS token still referenced elsewhere
- Adding any package not already in `package.json`
- Introducing a backend call, database client, or env var of any kind