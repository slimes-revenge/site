import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only Russian is published for now; `/` opens it.
  async redirects() {
    return Promise.resolve([{ source: "/", destination: "/ru", permanent: false }]);
  },
  async headers() {
    return Promise.resolve([
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ]);
  },
};

export default nextConfig;
