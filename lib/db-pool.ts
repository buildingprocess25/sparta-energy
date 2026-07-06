import { Pool } from "pg"
import { getPoolConfig } from "./db-utils"

const globalForDbPool = globalThis as unknown as {
  dbPool: Pool | undefined
}

function getPositiveIntegerEnv(name: string, fallback: number) {
  const value = Number(process.env[name])
  if (!Number.isInteger(value) || value <= 0) return fallback
  return value
}

function createDbPool() {
  return new Pool(
    getPoolConfig({
      // ponytail: keep default low; raise DB_POOL_MAX only with a pooler.
      max: getPositiveIntegerEnv(
        "DB_POOL_MAX",
        1
      ),
      idleTimeoutMillis: getPositiveIntegerEnv("DB_IDLE_TIMEOUT_MS", 10000),
      connectionTimeoutMillis: getPositiveIntegerEnv(
        "DB_CONNECTION_TIMEOUT_MS",
        15000
      ),
      allowExitOnIdle: true,
    })
  )
}

export const dbPool = globalForDbPool.dbPool ?? createDbPool()

if (!globalForDbPool.dbPool) {
  globalForDbPool.dbPool = dbPool
}
