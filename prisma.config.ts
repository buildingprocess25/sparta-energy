import { defineConfig } from "prisma/config"
import dotenv from "dotenv"

dotenv.config({ quiet: true })

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // DIRECT_URL is preferred for Prisma CLI operations.
    // DATABASE_URL is used as fallback when DIRECT_URL is not provided.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
})
