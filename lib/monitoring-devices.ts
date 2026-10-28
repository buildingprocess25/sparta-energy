import { getEnergyMonitoringUrl } from "@/lib/iot-status"

const DEVICES_TIMEOUT_MS = 8_000

export type MonitoringDevice = {
  id: string
  name: string
  storeCode: string | null
  storeName: string | null
  online: boolean
}

export type MonitoringDeviceList =
  | { available: true; devices: MonitoringDevice[] }
  | { available: false; message: string }

// GET /api/internal/devices on smart-energy-monitoring answers only with the shared
// MONITORING_INTERNAL_TOKEN, since sparta has no connection to DB 2.
export async function getMonitoringDevices(): Promise<MonitoringDeviceList> {
  const token = process.env.MONITORING_INTERNAL_TOKEN?.trim()
  if (!token) {
    return {
      available: false,
      message:
        "MONITORING_INTERNAL_TOKEN belum diisi, jadi daftar alat dari portal monitoring belum bisa dimuat.",
    }
  }

  try {
    const response = await fetch(
      new URL("/api/internal/devices", getEnergyMonitoringUrl()),
      {
        cache: "no-store",
        signal: AbortSignal.timeout(DEVICES_TIMEOUT_MS),
        headers: { "x-internal-token": token },
      }
    )
    if (!response.ok) {
      return {
        available: false,
        message:
          response.status === 401
            ? "Portal monitoring menolak token internal. Pastikan MONITORING_INTERNAL_TOKEN sama di kedua aplikasi."
            : "Daftar alat tidak bisa dimuat dari portal monitoring. Coba lagi nanti.",
      }
    }

    const payload = (await response.json()) as { devices?: unknown }
    const rows = Array.isArray(payload.devices) ? payload.devices : []
    const devices = rows.flatMap((row): MonitoringDevice[] => {
      const item = (row ?? {}) as Record<string, unknown>
      if (typeof item.id !== "string" || !item.id) return []
      return [
        {
          id: item.id,
          name:
            typeof item.name === "string" && item.name ? item.name : item.id,
          storeCode:
            typeof item.storeCode === "string" && item.storeCode
              ? item.storeCode.toUpperCase()
              : null,
          storeName: typeof item.storeName === "string" ? item.storeName : null,
          online: item.online === true,
        },
      ]
    })

    return { available: true, devices }
  } catch {
    return {
      available: false,
      message:
        "Daftar alat tidak bisa dimuat dari portal monitoring. Coba lagi nanti.",
    }
  }
}
