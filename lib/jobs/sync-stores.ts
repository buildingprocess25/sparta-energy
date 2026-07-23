type SheetCell = string | number | boolean | null | undefined

export type SheetStore = {
  code: string
  name: string
  branch: string
}

export type SyncStoresResult = {
  rows: number
  created: number
  skipped: number
}

const HEADER_ALIASES = {
  code: ["kode", "kode toko", "code", "store code"],
  name: ["nama", "nama toko", "name", "store name"],
  branch: ["cabang", "nama cabang", "branch", "branch name"],
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

export function parseStoreSheetRows(
  rows: readonly (readonly SheetCell[])[]
): SheetStore[] {
  const header = rows[0]
  if (!header) throw new Error("Spreadsheet tidak memiliki header")

  const codeIndex = findHeaderIndex(header, HEADER_ALIASES.code)
  const nameIndex = findHeaderIndex(header, HEADER_ALIASES.name)
  const branchIndex = findHeaderIndex(header, HEADER_ALIASES.branch)

  if ([codeIndex, nameIndex, branchIndex].includes(-1)) {
    throw new Error('Header wajib: "Kode Toko", "Nama Toko", dan "Cabang"')
  }

  const stores = new Map<string, SheetStore>()

  for (const [index, row] of rows.slice(1).entries()) {
    const code = String(row[codeIndex] ?? "").trim().toUpperCase()
    const name = String(row[nameIndex] ?? "").trim()
    const branch = String(row[branchIndex] ?? "").trim()

    if (row.every((cell) => !String(cell ?? "").trim())) continue
    if (!code || !name || !branch) {
      throw new Error(`Baris ${index + 2} tidak lengkap`)
    }

    const duplicate = stores.get(code)
    if (
      duplicate &&
      (duplicate.name !== name || duplicate.branch !== branch)
    ) {
      throw new Error(`Kode toko duplikat ${code} memiliki data berbeda`)
    }

    stores.set(code, { code, name, branch })
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
    select: { code: true },
  })
  const existingCodes = new Set(
    existingStores.map((store) => store.code.trim().toUpperCase())
  )
  const newStores = filterNewStores(stores, existingCodes)

  if (newStores.length === 0) {
    return { rows: stores.length, created: 0, skipped: stores.length }
  }

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
    })),
    skipDuplicates: true,
  })

  return {
    rows: stores.length,
    created: result.count,
    skipped: stores.length - result.count,
  }
}
