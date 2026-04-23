import { Pool } from "pg"

const globalForDbPool = globalThis as unknown as {
  dbPool: Pool | undefined
}

function getDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL
  if (!rawUrl) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  // Strip ?sslmode=require so it doesn't override manual SSL config.
  return rawUrl.replace("?sslmode=require", "")
}

function createDbPool() {
  return new Pool({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
    // Serverless-safe defaults from reference project.
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  })
}

export const dbPool = globalForDbPool.dbPool ?? createDbPool()

if (!globalForDbPool.dbPool) {
  globalForDbPool.dbPool = dbPool
}
