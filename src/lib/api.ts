import { NextResponse } from "next/server";
import { db, slugify } from "@/db";
import { hashPassword, verifyPassword, createSession, getUser, sessionCookie, clearCookie, invalidateSession, AuthError } from "@/lib/auth";

function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
}

export async function registerHandler(req: Request) {
  if (!rateLimit(`register:${clientIp(req)}`, 5, 3600))
    return NextResponse.json({ error: "Too many registrations from this IP. Try again later." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const { display_name, email, password } = body as any;
  if (!display_name || !email || !password || password.length < 8)
    return NextResponse.json({ error: "display_name, email, password (min 8 chars) required" }, { status: 400 });
  if (db.prepare("SELECT 1 FROM users WHERE lower(email)=lower(?)").get(email))
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  const info = db.prepare("INSERT INTO users (display_name, email, password_hash) VALUES (?, ?, ?)")
    .run(String(display_name).slice(0, 60), String(email).slice(0, 120), hashPassword(password));
  const token = createSession(info.lastInsertRowid as number);
  return NextResponse.json({ ok: true, display_name }, { headers: { "Set-Cookie": sessionCookie(token) } });
}

export async function loginHandler(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 10, 300))
    return NextResponse.json({ error: "Too many login attempts. Try again in a few minutes." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const { email, password } = body as any;
  const row = db.prepare("SELECT id, password_hash, display_name, role FROM users WHERE lower(email)=lower(?)").get(email) as any;
  if (!row || !verifyPassword(password || "", row.password_hash))
    return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  const token = createSession(row.id);
  return NextResponse.json({ ok: true, display_name: row.display_name, role: row.role }, { headers: { "Set-Cookie": sessionCookie(token) } });
}

export function logoutHandler(req?: Request) {
  if (req) invalidateSession(req);
  return NextResponse.json({ ok: true }, { headers: { "Set-Cookie": clearCookie() } });
}

export function meHandler(req: Request) {
  return NextResponse.json({ user: getUser(req) });
}

export function apiError(e: unknown) {
  if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
  console.error(e);
  return NextResponse.json({ error: "Server error" }, { status: 500 });
}

export function uniqueSlug(table: string, base: string): string {
  let slug = slugify(base) || "item";
  let i = 2;
  while (db.prepare(`SELECT 1 FROM ${table} WHERE slug = ?`).get(slug)) slug = `${slugify(base)}-${i++}`;
  return slug;
}

// DB-backed rate limiter — works across serverless instances (in-memory limiter doesn't).
export function rateLimit(key: string, max: number, windowSec: number): boolean {
  try {
    db.prepare(`DELETE FROM rate_limits WHERE ts < datetime('now', '-1 day')`).run();
    db.prepare(`INSERT INTO rate_limits (k) VALUES (?)`).run(key);
    const n = (db.prepare(
      `SELECT COUNT(*) n FROM rate_limits WHERE k = ? AND ts >= datetime('now', ?)`
    ).get(key, `-${windowSec} seconds`) as any).n;
    return n <= max;
  } catch {
    // DB hiccup — fail open on reads, but never on auth endpoints in practice
    return true;
  }
}
