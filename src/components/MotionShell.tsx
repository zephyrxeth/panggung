"use client";

import { useEffect } from "react";

/**
 * MotionShell — one tiny client shell for the whole site's scroll motion.
 * No libraries, no layout shift: everything is driven by CSS classes and
 * variables, so server-rendered HTML is identical with or without JS.
 *
 * - `html.is-scrolled`: toggled past 24px, used to firm up the floating header.
 * - `[data-reveal]`: IntersectionObserver adds `.is-visible` once an element
 *   enters the viewport (staggered via inline `--reveal-delay`).
 * - `[data-hero]`: sets `--hero-y` (clamped scroll offset in px) so the hero
 *   background drifts down and its content floats up + fades as you scroll.
 *
 * All of it is a no-op for `prefers-reduced-motion` users (see globals.css).
 */
export default function MotionShell() {
  useEffect(() => {
    const root = document.documentElement;

    // Reduced motion: leave everything in its final state.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const revealEls = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));

    const hero = document.querySelector<HTMLElement>("[data-hero]");
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        root.classList.toggle("is-scrolled", y > 24);
        if (hero) {
          const h = hero.offsetHeight || 1;
          const p = Math.min(y / h, 1);
          hero.style.setProperty("--hero-y", `${Math.round(p * 420)}px`);
        }
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
