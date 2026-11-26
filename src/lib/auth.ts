import * as crypto from "crypto";
import { db } from "@/db";

const SECRET = (() => {
  const v = process.env.SIDESTAGE_SECRET || process.env.PANGGUNG_SECRET;
  if (v) return v;
  if (process.env.NODE_ENV === "production")
    throw new Error("SIDESTAGE_SECRET must be set in production — refusing silent dev-secret fallback");
  return "dev-secret-change-me";
})();

export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pw, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}
export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(pw, salt, 32).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(test, "hex"));
}

export type SessionUser = { id: number; display_name: string; role: string };

export function createSession(userId: number): string {
  const token = crypto.randomBytes(24).toString("hex");
  db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', '+30 days'))")
    .run(token, userId);
  return token;
}

export function getUserByToken(token?: string): SessionUser | null {
  if (!token) return null;
  const row = db.prepare(
    `SELECT u.id, u.display_name, u.role FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > datetime('now')`
  ).get(token) as SessionUser | undefined;
  return row || null;
}
export function sessionTokenFrom(req: Request): string | undefined {
  const m = (req.headers.get("cookie") || "").match(/pg_session=([a-f0-9]+)/);
  return m?.[1];
}
export function getUser(req: Request): SessionUser | null {
  return getUserByToken(sessionTokenFrom(req));
}

const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";

export function invalidateSession(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/pg_session=([a-f0-9]+)/);
  if (m) db.prepare("DELETE FROM sessions WHERE token = ?").run(m[1]);
}
export function sessionCookie(token: string) {
  return `pg_session=${token}; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Max-Age=${30 * 86400}`;
}
export function clearCookie() {
  return `pg_session=; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Max-Age=0`;
}

export async function requireUser(req: Request): Promise<SessionUser> {
  const u = getUser(req);
  if (!u) throw new AuthError("Login required");
  return u;
}
export async function requireAdmin(req: Request): Promise<SessionUser> {
  const u = await requireUser(req);
  if (u.role !== "admin") throw new AuthError("Admin only", 403);
  return u;
}
export class AuthError extends Error {
  status: number;
  constructor(msg: string, status = 401) { super(msg); this.status = status; }
}
