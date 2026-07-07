import type { PoolConfig } from "pg"

/**
 * Parse DATABASE_URL and return a PoolConfig with SSL configured
 * based on the `sslmode` query parameter in the URL.
 *
 * - sslmode=disable  → ssl: false
 * - sslmode=require  → ssl: { rejectUnauthorized: false }
 * - no sslmode param → ssl: { rejectUnauthorized: false } (default, safe for cloud DBs)
 */
export function getPoolConfig(
  overrides?: Partial<PoolConfig>
): PoolConfig {
  const rawUrl = process.env.DATABASE_URL
  if (!rawUrl) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  // Extract sslmode value from URL before stripping it
  const sslModeMatch = rawUrl.match(/[?&]sslmode=([^&]*)/)
  const sslMode = sslModeMatch?.[1]?.toLowerCase()

  // Strip sslmode param — node-postgres manages TLS via the `ssl` option
  const connectionString = rawUrl
    .replace(/[?&]sslmode=[^&]*/g, "")
    .replace(/\?$/, "")

  // Determine SSL config based on sslmode value
  const ssl: PoolConfig["ssl"] =
    sslMode === "disable" ? false : { rejectUnauthorized: false }

  return {
    connectionString,
    ssl,
    ...overrides,
  }
}
