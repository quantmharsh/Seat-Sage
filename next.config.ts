import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: "upbeat-stoat-959.convex.cloud", protocol: "https" },
      { hostname: "wary-anaconda-29.convex.cloud", protocol: "https" },
      {hostname:"adamant-porpoise-461.convex.cloud", protocol:"https"},
      {hostname:"fearless-fly-955.convex.cloud" , protocol:"https"}
    ],
  },
};

export default nextConfig;