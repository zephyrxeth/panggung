import { NextResponse } from "next/server";
import { db } from "@/db";

export const dynamic = "force-dynamic";

// GET /api/health — trivial DB liveness check for uptime monitoring.
// No auth, and it exposes nothing beyond ok/error status.
export async function GET() {
  try {
    db.prepare("SELECT 1").get();
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
