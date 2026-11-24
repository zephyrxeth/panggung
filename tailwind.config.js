/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: { extend: { colors: { accent: "#2563eb", line: "#e4e4e7", muted: "#71717a" }, borderRadius: { xl: "0.875rem" } } },
  plugins: [],
};
