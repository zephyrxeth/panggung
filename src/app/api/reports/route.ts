import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiError, rateLimit } from "@/lib/api";

export const dynamic = "force-dynamic";
const REASONS = ["wrong_date", "cancelled", "duplicate", "suspicious_link", "other"];

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anon";
    if (!rateLimit(`report:${ip}`, 10, 3600)) return NextResponse.json({ error: "Rate limit" }, { status: 429 });
    const b = await req.json().catch(() => ({})) as any;
    const ev = db.prepare("SELECT id FROM events WHERE id = ?").get(Number(b.event_id)) as any;
    if (!ev) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    if (!REASONS.includes(b.reason)) return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    db.prepare("INSERT INTO reports (event_id, reporter_email, reason, detail) VALUES (?, ?, ?, ?)")
      .run(ev.id, String(b.reporter_email || "").slice(0, 120), b.reason, String(b.detail || "").slice(0, 500));
    return NextResponse.json({ ok: true });
  } catch (e) { return apiError(e); }
}
