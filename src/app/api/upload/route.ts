import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getUser, AuthError } from "@/lib/auth";
import { apiError, rateLimit } from "@/lib/api";

export const dynamic = "force-dynamic";
const ALLOWED = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp" };

export async function POST(req: Request) {
  try {
    const user = getUser(req);
    if (!user) throw new AuthError("Login required");
    if (!rateLimit(`upload:${user.id}`, 10, 3600)) return NextResponse.json({ error: "Rate limit" }, { status: 429 });
    let form: FormData;
    try { form = await req.formData(); } catch { return NextResponse.json({ error: "multipart form-data required" }, { status: 400 }); }
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "Max 2MB" }, { status: 400 });
    const ext = ALLOWED[file.type as keyof typeof ALLOWED];
    if (!ext) return NextResponse.json({ error: "Only png/jpg/webp" }, { status: 400 });
    const dir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(dir, { recursive: true });
    const name = `${user.id}-${Date.now()}${ext}`;
    fs.writeFileSync(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ ok: true, poster_path: `/uploads/${name}` });
  } catch (e) { return apiError(e); }
}
