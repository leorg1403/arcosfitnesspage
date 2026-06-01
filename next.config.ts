import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Prisma y pg corren solo en el servidor (Node). Mantenerlos como externos
  // evita que Turbopack/webpack intenten empaquetar el query engine en el bundle.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  experimental: {
    // Los payloads de reserva son diminutos (id de clase + contacto).
    // Bajar el límite (default 1MB) reduce superficie de DoS por payload.
    serverActions: {
      bodySizeLimit: "16kb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "videos.pexels.com" },
    ],
  },
};

export default nextConfig;
