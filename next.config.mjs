/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Static "Make a List" receipt page (public/struk/index.html)
      { source: "/struk", destination: "/struk/index.html" },
    ];
  },
};
export default nextConfig;
