"use client";
import { useEffect, useState } from "react";

const KEY = "sidestage_theme";

export default function ThemeToggle({ row = false }: { row?: boolean }) {
  const [light, setLight] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
    setReady(true);
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("light");
    document.documentElement.classList.toggle("light", next);
    try { localStorage.setItem(KEY, next ? "light" : "dark"); } catch {}
    setLight(next);
  }

  if (row) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/10 border-t border-white/10"
        aria-pressed={ready ? light : undefined}
      >
        <span className="text-lg leading-none w-6 text-center" aria-hidden="true">{light ? "☾" : "☀"}</span>
        {light ? "Mode Gelap" : "Mode Terang"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Ganti ke mode gelap" : "Ganti ke mode terang"}
      className="glass rounded-xl w-10 h-10 flex items-center justify-center text-lg focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:outline-none"
    >
      <span aria-hidden="true">{ready ? (light ? "☾" : "☀") : "☀"}</span>
    </button>
  );
}
