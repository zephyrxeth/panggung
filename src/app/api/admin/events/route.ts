import { NextResponse } from "next/server";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/api";

export const dynamic = "force-dynamic";

function log(moderatorId: number, targetType: string, targetId: number, action: string, reason: string) {
  db.prepare("INSERT INTO moderation_log (target_type, target_id, moderator_id, action, reason) VALUES (?, ?, ?, ?, ?)")
    .run(targetType, targetId, moderatorId, action, reason);
}

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const queue = db.prepare(
      `SELECT e.id, e.title, e.slug, e.status, e.type, e.starts_at, e.created_at, c.name AS city, u.display_name
       FROM events e JOIN cities c ON c.id=e.city_id LEFT JOIN users u ON u.id=e.created_by
       ORDER BY CASE e.status WHEN 'pending_review' THEN 0 ELSE 1 END, e.created_at DESC LIMIT 100`).all();
    const reports = db.prepare(
      `SELECT r.*, e.title FROM reports r JOIN events e ON e.id=r.event_id
       WHERE r.status='open' ORDER BY r.created_at DESC`).all();
    const log = db.prepare(
      `SELECT m.*, u.display_name AS moderator FROM moderation_log m JOIN users u ON u.id=m.moderator_id
       ORDER BY m.id DESC LIMIT 30`).all();
    return NextResponse.json({ queue, reports, log });
  } catch (e) { return apiError(e); }
}

// POST /api/admin/events  { id, action: approve|reject|cancel|merge|edit, duplicate_of?, patch? }
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req);
    const b = await req.json().catch(() => ({})) as any;
    const id = Number(b.id);
    const ev = db.prepare("SELECT * FROM events WHERE id = ?").get(id) as any;
    if (!ev) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const patch = (fields: object) => {
      const sets = Object.keys(fields).map(k => `${k} = ?`).join(", ");
      db.prepare(`UPDATE events SET ${sets}, updated_at = datetime('now') WHERE id = ?`)
        .run(...Object.values(fields) as any[], id);
    };

    switch (b.action) {
      case "approve":
        patch({ status: "verified" });
        db.prepare("UPDATE scout_contributions SET validation_status='validated', reputation_points=10 WHERE event_id=? AND validation_status='pending'").run(id);
        log(admin.id, "event", id, "approve", b.reason || "");
        break;
      case "reject":
        patch({ status: "rejected" });
        db.prepare("UPDATE scout_contributions SET validation_status='rejected' WHERE event_id=? AND validation_status='pending'").run(id);
        log(admin.id, "event", id, "reject", b.reason || "");
        break;
      case "cancel":
        patch({ status: "cancelled" });
        log(admin.id, "event", id, "cancel", b.reason || "");
        break;
      case "merge": {
        const target = Number(b.duplicate_of);
        const dup = db.prepare("SELECT id FROM events WHERE id = ?").get(target) as any;
        if (!dup || target === id) return NextResponse.json({ error: "Invalid duplicate_of" }, { status: 400 });
        patch({ status: "rejected", duplicate_of: target });
        db.prepare("UPDATE scout_contributions SET validation_status='validated', reputation_points=5, contribution_type='corrected' WHERE event_id=? AND validation_status='pending'").run(id);
        log(admin.id, "event", id, "merge", `merged into #${target}`);
        break;
      }
      case "edit": {
        const p = b.patch || {};
        const allowed: Record<string, unknown> = {};
        for (const k of ["title", "description", "starts_at", "venue_text", "price_info", "ticket_url"]) if (k in p) allowed[k] = String(p[k]).slice(0, 2000);
        if (!Object.keys(allowed).length) return NextResponse.json({ error: "Nothing to edit" }, { status: 400 });
        patch(allowed);
        patch({ status: "updated" });
        db.prepare("UPDATE scout_contributions SET validation_status='validated', reputation_points=5 WHERE event_id=? AND validation_status='pending'").run(id);
        log(admin.id, "event", id, "edit", Object.keys(allowed).join(","));
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    const updated = db.prepare("SELECT id, title, slug, status, duplicate_of FROM events WHERE id = ?").get(id);
    return NextResponse.json({ ok: true, event: updated });
  } catch (e) { return apiError(e); }
}
