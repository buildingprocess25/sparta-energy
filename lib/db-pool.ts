import { Pool } from "pg"

const globalForDbPool = globalThis as unknown as {
  dbPool: Pool | undefined
}

function getDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL
  if (!rawUrl) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  // Let node-postgres handle TLS via the `ssl` option below.
  return rawUrl.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "")
}

function getPositiveIntegerEnv(name: string, fallback: number) {
  const value = Number(process.env[name])
  if (!Number.isInteger(value) || value <= 0) return fallback
  return value
}

function createDbPool() {
  return new Pool({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
    max: getPositiveIntegerEnv(
      "DB_POOL_MAX",
      process.env.NODE_ENV === "production" ? 3 : 5
    ),
    idleTimeoutMillis: getPositiveIntegerEnv("DB_IDLE_TIMEOUT_MS", 10000),
    connectionTimeoutMillis: getPositiveIntegerEnv(
      "DB_CONNECTION_TIMEOUT_MS",
      15000
    ),
    allowExitOnIdle: true,
  })
}

export const dbPool = globalForDbPool.dbPool ?? createDbPool()

if (!globalForDbPool.dbPool) {
  globalForDbPool.dbPool = dbPool
}
