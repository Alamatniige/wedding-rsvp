## Context (carry forward)
- Repo already initialized with TanStack Start (not Next.js)
- No backend implementation yet — UI-first phase only
- RSVP section will require backend integration later (Supabase), but MUST NOT be implemented now
- All CSS MUST be centralized into a single `styles.css` file — no inline styles, no CSS modules, no Tailwind utility sprawl
- All new files MUST follow a clean, intentional directory structure (see constraints)

---

You are a senior frontend engineer and motion design specialist. Build a premium digital wedding invitation website using the existing TanStack Start repo.

## GOAL
Produce a fully furbished, mobile-first, 60 FPS wedding invitation UI with GSAP-powered animations and parallax scroll effects. No backend. No RSVP logic. Static data only throughout.

---

## TECH STACK — LOCKED, DO NOT DEVIATE
- Framework: TanStack Start (already initialized — do not re-scaffold or install conflicting router packages)
- Animations: GSAP with ScrollTrigger plugin (primary engine for ALL scroll-driven and entrance animations)
- Micro-interactions: Framer Motion (modal transitions, accordion expand/collapse, form step transitions only)
- Styling: Centralized in `src/styles.css` — use CSS custom properties for all design tokens (colors, fonts, spacing, z-index layers)
- 3D Welcome Gate: CSS 3D transforms (perspective, rotateX, translateZ) driven by GSAP — or if much better, use Spline or Three.js

---

## DIRECTORY STRUCTURE — MUST follow this exactly
src/
├── components/
│   ├── sections/
│   │   ├── WelcomeGate.tsx
│   │   ├── HeroSection.tsx
│   │   ├── OurStory.tsx
│   │   ├── Itinerary.tsx
│   │   ├── TravelAccommodations.tsx
│   │   ├── RSVPForm.tsx        ← UI shell only, no backend wiring
│   │   └── Registry.tsx
│   ├── ui/
│   │   ├── CountdownTimer.tsx
│   │   ├── ParallaxImage.tsx
│   │   ├── AnimatedText.tsx
│   │   └── Footer.tsx
│   └── layout/
│       └── StickyRSVPButton.tsx
├── hooks/
│   ├── useGSAP.ts              ← wrapper for GSAP context + cleanup
│   └── useScrollTrigger.ts     ← reusable ScrollTrigger setup hook
├── data/
│   └── weddingData.ts          ← all static mock content (names, dates, venues, schedule, hotels)
├── styles.css            ← ALL styles live here — design tokens + component styles + animations
└── routes/
└── index.tsx               ← root page, assembles all sections in order

---

## SECTION BUILD REQUIREMENTS

### Section 1 — Welcome Gate (WelcomeGate.tsx)
- Full-screen overlay with a centered 3D envelope using CSS `perspective` and `transform-style: preserve-3d`
- Envelope has a top flap (separate `div`) that opens via GSAP `rotateX` on click (fold-down hinge effect)
- After flap opens: inner card `translateY`s upward out of envelope using GSAP timeline
- Entire gate fades out (`opacity: 0`, `pointer-events: none`) after animation completes, revealing the page below
- Wax seal is a styled CSS circle with an SVG monogram — clicking it triggers the full GSAP sequence
- MUST use `will-change: transform, opacity` on animated elements for GPU promotion
- MUST clean up GSAP context on component unmount via the `useGSAP` hook

### Section 2 — Hero Section (HeroSection.tsx)
- Full-viewport section with a high-res background image (use a placeholder URL)
- Background image has a slow parallax drift (GSAP ScrollTrigger, `scrub: 1`, Y movement only — no layout reflow)
- Couple names rendered in large serif font, enter via staggered `opacity + translateY` on page load (after gate closes)
- Date, location in smaller weight below names
- CountdownTimer.tsx: live countdown to wedding date, updates every second via `setInterval`, styled as `DD HH MM SS` blocks
- StickyRSVPButton.tsx: fixed bottom-center CTA, appears after user scrolls past Hero, uses GSAP ScrollTrigger for show/hide

### Section 3 — Our Story & Photo Gallery (OurStory.tsx)
- Short romantic quote or narrative paragraph, centered, with a fade-in + slight upward drift on scroll (GSAP ScrollTrigger)
- 3-column responsive image grid (CSS Grid, collapses to 1-column on mobile)
- Each image fades in with staggered delay as it enters viewport — GSAP ScrollTrigger batch trigger
- Images use native `loading="lazy"` attribute

### Section 4 — Itinerary (Itinerary.tsx)
- Vertical timeline with milestone nodes (Ceremony → Cocktail Hour → Reception)
- Timeline line draws itself top-to-bottom on scroll using GSAP `scaleY` on a pseudo-element
- Each milestone expands on click/tap using Framer Motion `AnimatePresence` + `height: auto` transition to reveal sub-details
- Sub-details: venue hall name, time, dress code

### Section 5 — Travel & Accommodations (TravelAccommodations.tsx)
- Static embedded map iframe (Google Maps embed URL — use a placeholder)
- Three CTA buttons: "Open in Google Maps", "Open in Apple Maps", "Open in Waze" — use deep link URL schemes
- Hotel cards: CSS card layout, 2-up on desktop, stacked on mobile — show hotel name, discount code, distance from venue

### Section 6 — RSVP Form (RSVPForm.tsx)
- UI shell only — 3-step form with Framer Motion step transitions (`AnimatePresence`, slide + fade between steps)
- Step 1: Toggle "Joyfully Accepts" / "Regretfully Declines" (styled toggle, no radio inputs)
- Step 2: Name input field, dietary requirements dropdown
- Step 3: Plus-one toggle, song request text input, submit button
- Submit button logs form state to console only — NO API calls, NO Supabase, NO fetch

### Section 7 — Registry (Registry.tsx)
- Two tasteful card links to external registries (placeholder URLs)
- Optional "Wishing Well" card with a placeholder QR code image

### Footer (Footer.tsx)
- Warm closing message from the couple
- Day-of coordinator contact (static placeholder)
- Small attribution line: "Created with [Platform Name]"

---

## ANIMATION SYSTEM RULES — ENFORCED ACROSS ALL SECTIONS
1. ALL scroll animations use GSAP ScrollTrigger — NEVER use Intersection Observer manually
2. Animate ONLY `transform` and `opacity` — NEVER animate `width`, `height`, `top`, `left`, `margin`, or `padding`
3. Every GSAP context MUST be cleaned up in a return function inside `useGSAP` hook
4. `will-change: transform` MUST be applied to any element that animates on scroll
5. Parallax scrub animations MUST use `scrub: 1` (smoothed) — never `scrub: true` (instant)
6. All GSAP ScrollTrigger instances MUST set `invalidateOnRefresh: true` for resize safety
7. No animation should block the main thread — no synchronous heavy computation in scroll callbacks

---

## CSS ARCHITECTURE RULES (styles.css)
1. Top of file: CSS custom properties block (`:root { }`) defining ALL design tokens:
   - `--color-*` for the full palette (ivory, blush, champagne, deep navy, gold)
   - `--font-serif`, `--font-sans` mapped to Google Fonts imports at top of file
   - `--spacing-*` scale, `--radius-*`, `--shadow-*`, `--z-gate`, `--z-sticky`, `--z-modal`
2. Below tokens: base reset and global styles
3. Below reset: component styles organized by section, with matching comments `/* === Section: WelcomeGate === */`
4. NEVER use `!important`
5. All responsive breakpoints use `min-width` (mobile-first)

---

## PERFORMANCE CONSTRAINTS
- MUST achieve 60 FPS on mid-range Android devices (Snapdragon 6xx equivalent)
- GSAP ScrollTrigger MUST use `markers: false` in production builds
- No animation libraries other than GSAP and Framer Motion — no AOS, no Animate.css, no Wow.js
- All images: `loading="lazy"`, explicit `width` and `height` attributes set
- Font loading: `font-display: swap` on all custom fonts

---

## DELIVERABLES — IN THIS ORDER
1. Install commands for all required packages (GSAP, Framer Motion)
2. `src/styles/styles.css` — complete file with all design tokens and component styles
3. `src/data/weddingData.ts` — all static mock content
4. `src/hooks/useGSAP.ts` and `src/hooks/useScrollTrigger.ts`
5. All components in `src/components/` — sections first, then ui/, then layout/
6. `src/routes/index.tsx` — final assembly

After completing each file output: ✅ [filename] — done
Stop and ask before deleting or overwriting any existing file in the repo.
Do not install packages that conflict with the existing TanStack Start setup.
Do not add a backend, database client, or environment variable config of any kind.