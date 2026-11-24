/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: { extend: { colors: { accent: "#ef4444", line: "#27272a", muted: "#a1a1aa", paper: "#0a0a0a", ink: "#f5f5f4" }, borderRadius: { xl: "0.875rem" } } },
  plugins: [],
};
