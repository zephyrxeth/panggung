"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const ITEMS = [
  { href: "/explore", label: "Jelajah", icon: "◎" },
  { href: "/request", label: "Request", icon: "☆" },
  { href: "/submit", label: "Submit", icon: "✚" },
  { href: "/struk", label: "Make a List", icon: "☰" },
  { href: "/account", label: "Akun", icon: "◉" },
  { href: "/struk", label: "Make a List", icon: "▤" },
];

export default function MobileDock() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onClick = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("touchstart", onClick, { passive: true } as AddEventListenerOptions);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("touchstart", onClick);
    };
  }, [open]);

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-[calc(12px+env(safe-area-inset-bottom))]" aria-label="Menu utama">
      {open && (
        <div ref={panelRef} id="mobile-menu" className="glass rounded-2xl overflow-hidden mb-3 shadow-lg">
          {ITEMS.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-zinc-200 active:bg-white/10 ${i < ITEMS.length - 1 ? "border-b border-white/10" : ""}`}
            >
              <span className="text-red-400 text-lg leading-none w-6 text-center" aria-hidden="true">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </div>
      )}
      <div className="flex justify-center">
        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="glass rounded-full w-14 h-14 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:outline-none"
        >
          {open ? (
            <span className="text-zinc-200 text-2xl leading-none" aria-hidden="true">×</span>
          ) : (
            <span className="flex flex-col gap-[5px]" aria-hidden="true">
              <span className="block w-6 h-[2px] bg-zinc-200 rounded-full" />
              <span className="block w-6 h-[2px] bg-zinc-200 rounded-full" />
              <span className="block w-6 h-[2px] bg-zinc-200 rounded-full" />
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
