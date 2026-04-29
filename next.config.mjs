import withSerwistInit from "@serwist/next"

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "*.devtunnels.ms",
    "*.devtunnels.ms:*",
    "*.ngrok-free.dev",
    "*.ngrok-free.dev:*",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.devtunnels.ms",
        "*.devtunnels.ms:*",
        "*.ngrok-free.dev",
        "*.ngrok-free.dev:*",
      ],
    },
  },
}

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
})

export default withSerwist(nextConfig)
