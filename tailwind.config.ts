import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { ink:"#141318", paper:"#faf9f7", accent:"#e11d48", muted:"#6b6672", line:"#e7e4df" }, borderRadius: { DEFAULT:"12px" } } } } satisfies Config;
