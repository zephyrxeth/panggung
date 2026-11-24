import { NextResponse } from "next/server";
import { db } from "@/db";
import { getUser, AuthError } from "@/lib/auth";
import { apiError, rateLimit } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/interest  { event_id }  — unique per user+event
export async function POST(req: Request) {
  try {
    const user = getUser(req);
    if (!user) throw new AuthError("Login required to mark interest");
    if (!rateLimit(`interest:${user.id}`, 30, 3600)) return NextResponse.json({ error: "Rate limit" }, { status: 429 });
    const { event_id } = await req.json().catch(() => ({})) as any;
    const ev = db.prepare("SELECT id, status FROM events WHERE id = ?").get(event_id) as any;
    if (!ev || !["verified", "updated"].includes(ev.status))
      return NextResponse.json({ error: "Event not found or not published" }, { status: 404 });
    try {
      db.prepare("INSERT INTO event_interest (user_id, event_id) VALUES (?, ?)").run(user.id, ev.id);
    } catch { /* already interested */ }
    const n = (db.prepare("SELECT COUNT(*) n FROM event_interest WHERE event_id = ?").get(ev.id) as any).n;
    return NextResponse.json({ ok: true, interested: n });
  } catch (e) { return apiError(e); }
}
