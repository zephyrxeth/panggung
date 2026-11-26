#!/usr/bin/env node
// Promote a registered user to admin — server-side only (see docs/ADMIN-PROVISIONING.md).
import Database from "libsql";
const email = process.argv[2];
if (!email) { console.error("usage: node scripts/promote-admin.mjs <email>"); process.exit(1); }
const db = new Database(process.env.TURSO_DATABASE_URL, { authToken: process.env.TURSO_AUTH_TOKEN });
const r = db.prepare("UPDATE users SET role='admin' WHERE lower(email)=lower(?)").run(email);
console.log("promoted rows:", r.changes);
