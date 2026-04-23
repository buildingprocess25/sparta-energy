import "dotenv/config"
import { defineConfig } from "prisma/config"

const databaseUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
    ? process.env.DATABASE_URL
    : "postgresql://invalid:invalid@127.0.0.1:1/prisma_placeholder"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Allow `prisma generate` in CI even when DATABASE_URL is not injected.
    url: databaseUrl,
  },
})
