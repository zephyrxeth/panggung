// Timezone helpers — WIB (Asia/Jakarta, UTC+7) is the user-facing timezone.
// DB convention: timestamps are stored as UTC naive "YYYY-MM-DD HH:MM:SS".

const RE = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/;

function parts(s: string): [string, string, string, string] {
  const m = s.trim().match(RE);
  if (!m) throw new Error(`invalid datetime: ${s}`);
  return [m[1], m[2], m[3], m[4] || "00"];
}

function shift(s: string, hours: number): Date {
  const [d, hh, mm, ss] = parts(s);
  const dt = new Date(`${d}T${hh}:${mm}:${ss}Z`);
  dt.setUTCHours(dt.getUTCHours() + hours);
  return dt;
}

/** datetime-local value from a WIB user -> UTC string for persistence. */
export function wibLocalToUtc(local: string): string {
  return shift(local, -7).toISOString().slice(0, 19).replace("T", " ");
}

/** UTC string from DB -> datetime-local value in WIB (for prefill/display in inputs). */
export function utcToWibInput(utc: string): string {
  return shift(utc, 7).toISOString().slice(0, 16);
}

/** UTC string from DB -> JS Date that renders correctly with Intl timeZone Asia/Jakarta. */
export function utcDate(utc: string): Date {
  const [d, hh, mm, ss] = parts(utc);
  return new Date(`${d}T${hh}:${mm}:${ss}Z`);
}

export function fmtWibDate(utc: string, opts: Intl.DateTimeFormatOptions = { dateStyle: "full" }): string {
  return utcDate(utc).toLocaleDateString("id-ID", { ...opts, timeZone: "Asia/Jakarta" });
}

export function fmtWibTime(utc: string): string {
  return utcDate(utc).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
}
