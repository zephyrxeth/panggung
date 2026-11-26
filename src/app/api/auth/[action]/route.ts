import { NextResponse } from "next/server";
import { registerHandler, loginHandler, logoutHandler, meHandler } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: { action: string } }) {
  const { action } = ctx.params;
  if (action === "register") return registerHandler(req);
  if (action === "login") return loginHandler(req);
  if (action === "logout") return logoutHandler(req);
  return NextResponse.json({ error: "Unknown action" }, { status: 404 });
}

export async function GET(req: Request, ctx: { params: { action: string } }) {
  if (ctx.params.action === "me") return meHandler(req);
  return NextResponse.json({ error: "Unknown action" }, { status: 404 });
}
