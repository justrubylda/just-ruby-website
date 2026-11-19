import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // ficheiros do Excel/Airbnb/Booking carregados na área de gestão
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
