import withSerwistInit from "@serwist/next"

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  turbopack: {},
  allowedDevOrigins: [
    "localhost:*",
    "*.devtunnels.ms",
    "*.devtunnels.ms:*",
    "*.ngrok-free.dev",
    "*.ngrok-free.dev:*",
  ],
  serverActions: {
    allowedOrigins: [
      "localhost:*",
      "*.devtunnels.ms",
      "*.devtunnels.ms:*",
      "*.ngrok-free.dev",
      "*.ngrok-free.dev:*",
      "energy.sparta-alfamart.web.id"
    ],
  },
}

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
})

export default withSerwist(nextConfig)
