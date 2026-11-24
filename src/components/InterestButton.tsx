"use client";
import { useState } from "react";

export default function InterestButton({ eventId, initialCount, disabled }: { eventId: number; initialCount: number; disabled?: boolean }) {
  const [count, setCount] = useState(initialCount);
  const [state, setState] = useState<"idle" | "done" | "needlogin" | "error">("idle");
  const [busy, setBusy] = useState(false);

  async function click() {
    setBusy(true);
    try {
      const r = await fetch("/api/interest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event_id: eventId }) });
      const d = await r.json();
      if (r.status === 401) setState("needlogin");
      else if (r.ok) { setState("done"); setCount(d.interested); }
      else setState("error");
    } finally { setBusy(false); }
  }

  if (disabled) return <span className="btn-ghost text-muted cursor-default">Tertutup</span>;
  return (
    <span className="inline-flex items-center gap-2">
      <button className="btn-ghost" onClick={click} disabled={busy || state === "done"}>
        {state === "done" ? "✓ Tertarik" : "Saya tertarik"}
      </button>
      <span className="text-sm text-muted">{count}</span>
      {state === "needlogin" && <a href="/login?next=interest" className="text-sm text-accent underline">login dulu</a>}
    </span>
  );
}
