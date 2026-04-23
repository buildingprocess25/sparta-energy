import { Pool } from "pg"

const globalForDbPool = globalThis as unknown as {
  dbPool: Pool | undefined
}

function parsePositiveIntEnv(name: string, fallback: number) {
  const raw = process.env[name]
  if (!raw) return fallback

  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function getDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL
  if (!rawUrl) {
    throw new Error("DATABASE_URL is not set")
  }

  // Strip sslmode from URL — SSL is configured directly via Pool options.
  return rawUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "")
}

function createDbPool() {
  return new Pool({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
    // Serverless-safe defaults: one connection per runtime instance.
    max: parsePositiveIntEnv("PG_POOL_MAX", 1),
    // Release idle connections quickly to avoid exhausting DB slots.
    idleTimeoutMillis: parsePositiveIntEnv("PG_IDLE_TIMEOUT_MS", 5_000),
    connectionTimeoutMillis: parsePositiveIntEnv(
      "PG_CONNECT_TIMEOUT_MS",
      5_000
    ),
    allowExitOnIdle: true,
  })
}

export const dbPool = globalForDbPool.dbPool ?? createDbPool()

if (!globalForDbPool.dbPool) {
  globalForDbPool.dbPool = dbPool
}
