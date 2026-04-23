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

export default nextConfig
