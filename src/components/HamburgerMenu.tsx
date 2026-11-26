"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

export const MENU_ITEMS = [
  { href: "/explore", label: "Jelajah", icon: "◎" },
  { href: "/request", label: "Request", icon: "☆" },
  { href: "/submit", label: "Submit", icon: "✚" },
  { href: "/account", label: "Akun", icon: "◉" },
  { href: "/struk", label: "Make a List", icon: "▤" },
];

export default function HamburgerMenu({ direction = "up", align = "center", size = "md" }: { direction?: "up" | "down"; align?: "center" | "right"; size?: "md" | "sm" }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
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

  const btnCls = size === "sm"
    ? "glass rounded-xl w-10 h-10 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:outline-none"
    : "glass rounded-full w-14 h-14 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:outline-none";

  const panelPos = direction === "up"
    ? "mb-3"
    : "mt-3 absolute right-0 top-full";

  return (
    <div className="relative flex flex-col items-center">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Tutup menu" : "Buka menu"}
        className={btnCls}
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
      {open && (
        <div
          ref={panelRef}
          id={menuId}
          className={`glass rounded-2xl overflow-hidden shadow-lg ${panelPos} ${align === "right" ? "w-56" : "w-52"}`}
        >
          {MENU_ITEMS.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold text-zinc-200 active:bg-white/10 hover:bg-white/10 ${i < MENU_ITEMS.length - 1 ? "border-b border-white/10" : ""}`}
            >
              <span className="text-red-400 text-lg leading-none w-6 text-center" aria-hidden="true">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
