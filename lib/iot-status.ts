const DEFAULT_ENERGY_MONITORING_URL =
  "https://energy-monitoring.sparta-alfamart.web.id/"
const IOT_CACHE_SECONDS = 300
const IOT_TIMEOUT_MS = 5000

export type IotStatus = "live" | "historical" | "none"

export type StoreIotInfo = {
  status: IotStatus
  deviceCount: number
  isRecording: boolean
}

export type IotStatusLookup =
  | { available: true; byCode: Map<string, StoreIotInfo> }
  | { available: false }

type MonitoringStoreRow = {
  code?: unknown
  status?: unknown
  deviceCount?: unknown
  isRecording?: unknown
}

export function getEnergyMonitoringUrl() {
  return (
    process.env.ENERGY_MONITORING_URL?.trim() || DEFAULT_ENERGY_MONITORING_URL
  )
}

// GET /api/stores on smart-energy-monitoring lists only stores that have a device,
// matched by the store code in the device name. Read-only, no auth on that side.
export async function getIotStatusLookup(): Promise<IotStatusLookup> {
  try {
    const response = await fetch(
      new URL("/api/stores", getEnergyMonitoringUrl()),
      {
        next: { revalidate: IOT_CACHE_SECONDS },
        signal: AbortSignal.timeout(IOT_TIMEOUT_MS),
      }
    )
    if (!response.ok) return { available: false }

    return buildIotLookup(await response.json())
  } catch {
    return { available: false }
  }
}

export function buildIotLookup(rows: unknown): IotStatusLookup {
  if (!Array.isArray(rows)) return { available: false }

  const byCode = new Map<string, StoreIotInfo>()
  for (const row of rows as MonitoringStoreRow[]) {
    if (typeof row.code !== "string" || !row.code.trim()) continue
    byCode.set(row.code.trim().toUpperCase(), {
      status: row.status === "live" ? "live" : "historical",
      deviceCount: Number(row.deviceCount) || 0,
      isRecording: row.isRecording === true,
    })
  }

  return { available: true, byCode }
}

export function getIotInstalledCodes(lookup: IotStatusLookup) {
  return lookup.available ? Array.from(lookup.byCode.keys()) : []
}

// null means the portal could not be reached, so the status is unknown.
export function getStoreIot(
  lookup: IotStatusLookup,
  storeCode: string
): StoreIotInfo | null {
  if (!lookup.available) return null
  return (
    lookup.byCode.get(storeCode.trim().toUpperCase()) ?? {
      status: "none",
      deviceCount: 0,
      isRecording: false,
    }
  )
}
