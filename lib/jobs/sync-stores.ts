type SheetCell = string | number | boolean | null | undefined

export type SheetStore = {
  code: string
  name: string
  branch: string
  latitude?: number | null
  longitude?: number | null
}

export type SyncStoresResult = {
  rows: number
  created: number
  updated: number
  skipped: number
}

const HEADER_ALIASES = {
  code: ["kode", "kode toko", "code", "store code"],
  name: ["nama", "nama toko", "name", "store name"],
  branch: ["cabang", "nama cabang", "branch", "branch name"],
  coordinates: [
    "titik koordinat",
    "koordinat",
    "lat long",
    "coordinates",
    "location",
  ],
} as const

function requiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} env variable is not set`)
  return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function normalizeHeader(value: SheetCell) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
}

function findHeaderIndex(
  header: readonly SheetCell[],
  aliases: readonly string[]
) {
  return header.findIndex((cell) => aliases.includes(normalizeHeader(cell)))
}

export function parseCoordinates(
  cell: SheetCell
): { latitude: number; longitude: number } | null {
  if (!cell) return null
  const str = String(cell).trim()
  if (!str) return null
  const parts = str.split(/[\s,]+/).map((s) => parseFloat(s.trim()))
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { latitude: parts[0], longitude: parts[1] }
  }
  return null
}

export function parseStoreSheetRows(
  rows: readonly (readonly SheetCell[])[]
): SheetStore[] {
  const header = rows[0]
  if (!header) throw new Error("Spreadsheet tidak memiliki header")

  const codeIndex = findHeaderIndex(header, HEADER_ALIASES.code)
  const nameIndex = findHeaderIndex(header, HEADER_ALIASES.name)
  const branchIndex = findHeaderIndex(header, HEADER_ALIASES.branch)
  const coordIndex = findHeaderIndex(header, HEADER_ALIASES.coordinates)

  if ([codeIndex, nameIndex, branchIndex].includes(-1)) {
    throw new Error('Header wajib: "Kode Toko", "Nama Toko", dan "Cabang"')
  }

  const stores = new Map<string, SheetStore>()

  for (const [index, row] of rows.slice(1).entries()) {
    const code = String(row[codeIndex] ?? "").trim().toUpperCase()
    const name = String(row[nameIndex] ?? "").trim()
    const branch = String(row[branchIndex] ?? "").trim()
    const rawCoord = coordIndex !== -1 ? row[coordIndex] : null
    const coords = parseCoordinates(rawCoord)

    if (row.every((cell) => !String(cell ?? "").trim())) continue
    if (!code || !name || !branch) {
      console.warn(
        `[sync-stores] Warning: Baris ${index + 2} tidak lengkap (skip):`,
        { code, name, branch }
      )
      continue
    }

    const duplicate = stores.get(code)
    if (
      duplicate &&
      (duplicate.name !== name || duplicate.branch !== branch)
    ) {
      console.warn(
        `[sync-stores] Warning: Baris ${index + 2} memiliki kode toko duplikat ${code} (skip)`
      )
      continue
    }

    stores.set(code, {
      code,
      name,
      branch,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
    })
  }

  return [...stores.values()]
}

export function filterNewStores(
  stores: readonly SheetStore[],
  existingCodes: ReadonlySet<string>
) {
  return stores.filter((store) => !existingCodes.has(store.code))
}

async function fetchAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      refresh_token: requiredEnv("GOOGLE_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
  })

  if (!response.ok) {
    throw new Error(`Google OAuth request failed (${response.status})`)
  }

  const payload: unknown = await response.json()
  if (
    !isRecord(payload) ||
    typeof payload.access_token !== "string" ||
    !payload.access_token
  ) {
    throw new Error("Google OAuth response did not include an access token")
  }

  return payload.access_token
}

async function fetchStoreSheet(): Promise<SheetCell[][]> {
  const spreadsheetId = requiredEnv("GOOGLE_STORE_SPREADSHEET_ID")
  const range = requiredEnv("GOOGLE_STORE_SHEET_RANGE")
  const accessToken = await fetchAccessToken()
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/` +
    `${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Google Sheets request failed (${response.status})`)
  }

  const payload: unknown = await response.json()
  if (!isRecord(payload) || payload.values === undefined) return []
  if (
    !Array.isArray(payload.values) ||
    payload.values.some((row) => !Array.isArray(row))
  ) {
    throw new Error("Google Sheets response contained invalid rows")
  }

  return payload.values as SheetCell[][]
}

export async function syncStoresFromSheet(): Promise<SyncStoresResult> {
  const stores = parseStoreSheetRows(await fetchStoreSheet())
  const { prisma } = await import("@/lib/prisma")
  const existingStores = await prisma.store.findMany({
    select: { id: true, code: true, latitude: true, longitude: true },
  })
  const existingMap = new Map(
    existingStores.map((store) => [store.code.trim().toUpperCase(), store])
  )
  const existingCodes = new Set(existingMap.keys())
  const newStores = filterNewStores(stores, existingCodes)

  let createdCount = 0
  if (newStores.length > 0) {
    const result = await prisma.store.createMany({
      data: newStores.map((store) => ({
        code: store.code,
        name: store.name,
        branch: store.branch,
        plnCustomerId: null,
        type: "",
        is24Hours: false,
        openTime: "08:00",
        closeTime: "22:00",
        plnPowerVa: 0,
        parkingAreaM2: 0,
        terraceAreaM2: 0,
        salesAreaM2: 0,
        warehouseAreaM2: 0,
        latitude: store.latitude ?? null,
        longitude: store.longitude ?? null,
      })),
      skipDuplicates: true,
    })
    createdCount = result.count
  }

  // Safely update coordinates for existing stores if they were null in DB
  let updatedCount = 0
  for (const sheetStore of stores) {
    const existing = existingMap.get(sheetStore.code)
    if (
      existing &&
      (existing.latitude === null || existing.longitude === null) &&
      sheetStore.latitude !== null &&
      sheetStore.longitude !== null &&
      sheetStore.latitude !== undefined &&
      sheetStore.longitude !== undefined
    ) {
      await prisma.store.update({
        where: { id: existing.id },
        data: {
          latitude: sheetStore.latitude,
          longitude: sheetStore.longitude,
        },
      })
      updatedCount++
    }
  }

  return {
    rows: stores.length,
    created: createdCount,
    updated: updatedCount,
    skipped: stores.length - createdCount - updatedCount,
  }
}
