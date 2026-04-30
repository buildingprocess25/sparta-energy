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

function createDbPool() {
  return new Pool({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 3_000,
    allowExitOnIdle: true,
  })
}

export const dbPool = globalForDbPool.dbPool ?? createDbPool()

if (!globalForDbPool.dbPool) {
  globalForDbPool.dbPool = dbPool
}
