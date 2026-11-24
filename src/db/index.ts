import Database from "libsql";
import fs from "fs";
import path from "path";

/**
 * libSQL/Turso driver — drop-in compatible dengan better-sqlite3.
 * Env:
 *   TURSO_DATABASE_URL  libsql://<db>-<org>.turso.io  (kosong = lokal file)
 *   TURSO_AUTH_TOKEN    turso db tokens create ...
 *   PANGGUNG_DB         path SQLite lokal (default data/panggung.db)
 */

const localPath = process.env.PANGGUNG_DB || path.join(process.cwd(), "data", "panggung.db");
if (!process.env.TURSO_DATABASE_URL) fs.mkdirSync(path.dirname(localPath), { recursive: true });

export const db = process.env.TURSO_DATABASE_URL
  ? new Database(process.env.TURSO_DATABASE_URL, { authToken: process.env.TURSO_AUTH_TOKEN } as any)
  : new Database(localPath);

if (!process.env.TURSO_DATABASE_URL && typeof (db as any).pragma === "function") (db as any).pragma("journal_mode = WAL");

export function migrate() {
  try {
    const schema = fs.readFileSync(path.join(process.cwd(), "src", "db", "schema.sql"), "utf8");
    db.exec(schema);
  } catch (e: any) {
    if (!String(e?.message).includes("already exists")) throw e;
  }
}
migrate();

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
