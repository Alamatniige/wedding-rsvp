// Section 1 — The Welcome Gate (envelope unboxing).
// Full-screen overlay with a CSS-3D envelope. On wax-seal click,
// a GSAP timeline rotates the flap, glides the card upward, and fades
// the overlay out. The "opened" state persists in sessionStorage.

import { useEffect, useRef, useState } from "react";
import { WaxSeal } from "./WaxSeal";
import envelopeTexture from "@/assets/envelope-texture.jpg";

type Props = {
  partnerA: string;
  partnerB: string;
  dateDisplay: string;
  onOpened: () => void;
};

const STORAGE_KEY = "wedding:envelope-opened";

export function WelcomeGate({ partnerA, partnerB, dateDisplay, onOpened }: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const flapRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const sealRef = useRef<HTMLButtonElement | null>(null);
  const [hidden, setHidden] = useState(false);
  const [opening, setOpening] = useState(false);

  // Skip the gate on subsequent visits in the same session.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setHidden(true);
      onOpened();
    }
  }, [onOpened]);

  // Idle pulse on the seal.
  useEffect(() => {
    if (hidden || opening) return;
    let raf = 0;
    let mounted = true;
    (async () => {
      const { gsap } = await import("gsap");
      if (!mounted || !sealRef.current) return;
      gsap.to(sealRef.current, {
        scale: 1.06,
        duration: 1.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    })();
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
    };
  }, [hidden, opening]);

  const handleOpen = async () => {
    if (opening) return;
    setOpening(true);
    const { gsap } = await import("gsap");

    // Stop the idle pulse cleanly.
    gsap.killTweensOf(sealRef.current);

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setHidden(true);
        onOpened();
      },
    });

    tl.to(sealRef.current, { scale: 0.85, opacity: 0, duration: 0.35, ease: "power2.in" })
      .to(
        flapRef.current,
        { rotateX: -180, duration: 1.1, transformOrigin: "top center" },
        "<0.1",
      )
      .to(
        cardRef.current,
        { y: "-120%", duration: 1.2, ease: "power3.out" },
        "-=0.6",
      )
      .to(overlayRef.current, { opacity: 0, duration: 0.6 }, "-=0.4");
  };

  if (hidden) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.16_0.04_25)] px-6"
      style={{ contain: "strict" }}
    >
      {/* soft vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative w-full max-w-md envelope-scene">
        {/* The card glides up from behind the envelope */}
        <div
          ref={cardRef}
          className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
          style={{ willChange: "transform" }}
        >
          <div className="flex h-72 w-72 flex-col items-center justify-center rounded-sm bg-ivory px-6 text-center text-ink shadow-2xl">
            <p className="text-[10px] uppercase tracking-[0.4em] text-bordeaux">
              You are invited
            </p>
            <div className="my-3 h-px w-16 bg-gold/60" />
            <h2 className="font-display text-3xl italic leading-tight">
              {partnerA} <span className="text-gold">&amp;</span> {partnerB}
            </h2>
            <p className="mt-2 text-xs tracking-[0.25em] uppercase text-muted-foreground">
              {dateDisplay}
            </p>
          </div>
        </div>

        {/* Envelope body */}
        <div
          className="relative z-10 mx-auto aspect-7/5 w-full max-w-sm overflow-hidden rounded-sm bg-cover bg-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
          style={{
            backgroundImage: `url(${envelopeTexture})`,
          }}
        >
          {/* triangular flap */}
          <div
            ref={flapRef}
            className="absolute inset-x-0 top-0 z-20 envelope-flap"
            style={{
              height: "62%",
              backgroundImage: `url(${envelopeTexture})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              filter: "brightness(0.96)",
            }}
          />
          {/* shadow line where flap closes */}
          <div
            className="pointer-events-none absolute inset-x-0 z-10"
            style={{
              top: "calc(62% - 1px)",
              height: "2px",
              background:
                "linear-gradient(to right, transparent, rgba(0,0,0,0.15), transparent)",
            }}
          />
          {/* address line */}
          <div className="absolute inset-x-0 bottom-4 z-10 text-center">
            <p className="font-display text-xs italic text-bordeaux/70">
              To our beloved guest
            </p>
          </div>
        </div>

        {/* Wax seal */}
        <div className="pointer-events-auto absolute left-1/2 top-[62%] z-30 -translate-x-1/2 -translate-y-1/2">
          <WaxSeal ref={sealRef} onClick={handleOpen} />
        </div>
      </div>
    </div>
  );
}


// Wax seal SVG used as the open-envelope button.

import { forwardRef } from "react";

type Props = {
  onClick?: () => void;
  ariaLabel?: string;
};

export const WaxSeal = forwardRef<HTMLButtonElement, Props>(function WaxSeal(
  { onClick, ariaLabel = "Open the invitation" },
  ref,
) {
  return (
    <button
      ref={ref}
      onClick={onClick}
      aria-label={ariaLabel}
      className="group relative h-28 w-28 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-gold"
      style={{ willChange: "transform" }}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full drop-shadow-[0_8px_24px_rgba(80,20,30,0.45)]">
        <defs>
          <radialGradient id="wax" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="oklch(0.55 0.18 25)" />
            <stop offset="60%" stopColor="oklch(0.38 0.14 22)" />
            <stop offset="100%" stopColor="oklch(0.24 0.09 22)" />
          </radialGradient>
          <radialGradient id="shine" cx="35%" cy="30%" r="25%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        {/* drip edges */}
        <path
          d="M60 6 C 78 8 102 18 110 38 C 118 60 108 96 86 110 C 64 122 36 116 18 100 C 0 84 4 50 18 32 C 28 18 44 8 60 6 Z"
          fill="url(#wax)"
        />
        {/* monogram */}
        <text
          x="50%"
          y="56%"
          textAnchor="middle"
          fontFamily="Cormorant Garamond, serif"
          fontSize="44"
          fontStyle="italic"
          fill="oklch(0.88 0.06 85)"
          opacity="0.9"
        >
          A&amp;L
        </text>
        {/* highlight */}
        <ellipse cx="44" cy="38" rx="22" ry="14" fill="url(#shine)" />
      </svg>
      <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs uppercase tracking-[0.3em] text-ivory/80">
        Tap to open
      </span>
    </button>
  );
});
