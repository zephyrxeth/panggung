import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = process.env.PANGGUNG_DB || path.join(process.cwd(), "data", "panggung.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

export function migrate() {
  const schema = fs.readFileSync(path.join(process.cwd(), "src", "db", "schema.sql"), "utf8");
  db.exec(schema);
}
migrate();

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
