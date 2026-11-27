"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * MotionShell v2 — the site's whole scroll-feel in one tiny client shell.
 *
 * Three layers, all aimed at "glides, never steps":
 * - Lenis (wheel only; touch stays native) smooths scrolling itself with a
 *   soft lerp, so the page has real inertia instead of wheel-notch jumps.
 *   Anchor links are routed through it too (`anchors` + header offset).
 * - `[data-reveal]`: IntersectionObserver adds `.is-visible` once — elements
 *   rise + un-blur with a long expo-out ease, staggered via `--reveal-delay`.
 * - Hero parallax is *chased*, not tracked: each frame the parallax value
 *   lerps toward the real scroll position, so the hero drifts a beat behind
 *   your scroll and settles softly instead of locking to the wheel.
 *
 * `prefers-reduced-motion` users skip Lenis entirely and get final states.
 */
export default function MotionShell() {
  useEffect(() => {
    const root = document.documentElement;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      anchors: { offset: -96 },
    });

    const hero = document.querySelector<HTMLElement>("[data-hero]");
    let chased = window.scrollY || 0;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      const y = window.scrollY || 0;
      root.classList.toggle("is-scrolled", y > 24);
      if (hero) {
        chased += (y - chased) * 0.085;
        if (Math.abs(y - chased) < 0.05) chased = y;
        const h = hero.offsetHeight || 1;
        const p = Math.min(Math.max(chased, 0) / h, 1);
        hero.style.setProperty("--hero-y", `${(p * 420).toFixed(1)}px`);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      io.disconnect();
    };
  }, []);

  return null;
}
