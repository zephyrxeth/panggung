import { wibLocalToUtc, utcToWibInput, utcDate } from "../src/lib/tz";
let fail = 0;
const eq = (name, a, b) => { const ok = a === b; if (!ok) fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${a}${ok ? "" : " != " + b}`); };

// conversion WIB -> UTC
eq("midnight WIB -> UTC prev day", wibLocalToUtc("2026-11-25T00:00"), "2026-11-24 17:00:00");
eq("noon WIB -> UTC", wibLocalToUtc("2026-11-25T12:30"), "2026-11-25 05:30:00");
eq("23:59 WIB -> UTC", wibLocalToUtc("2026-11-25T23:59"), "2026-11-25 16:59:00");
// roundtrip
eq("roundtrip midnight", utcToWibInput("2026-11-24 17:00:00"), "2026-11-25T00:00");
// display in WIB
eq("display WIB", utcDate("2026-11-24 17:00:00").toLocaleString("id-ID", { timeZone: "Asia/Jakarta", hour12: false }), "25/11/2026, 00.00.00");
// invalid rejected
try { wibLocalToUtc("bukan-tanggal"); fail++; console.log("FAIL invalid not rejected"); }
catch { console.log("PASS invalid datetime rejected"); }
process.exit(fail ? 1 : 0);
