// Step 1 technical data (store type, PLN VA, areas, hours) as snapshotted on an audit.
// The store master is only updated from this snapshot when an admin validates.

type DecimalLike = { toString(): string } | number | string | null | undefined

export type TechnicalInput = {
  storeType?: string | null
  is24Hours?: boolean
  openTime?: string
  closeTime?: string
  plnPowerVa?: number
  areas?: {
    sales: number
    parkir: number
    teras: number
    gudang: number
    toilet: number
    selasar: number
  }
}

export type AuditTechnicalColumns = {
  storeType?: string | null
  plnPowerVa?: number
  salesAreaM2?: number
  parkingAreaM2?: number
  terraceAreaM2?: number
  warehouseAreaM2?: number
  toiletAreaM2?: number
  corridorAreaM2?: number
  is24Hours?: boolean
  openTime?: string | null
  closeTime?: string | null
}

// Fields left out of the input stay undefined, so Prisma keeps what the audit already has.
export function toAuditTechnical(input: TechnicalInput): AuditTechnicalColumns {
  const { areas, is24Hours } = input
  return {
    storeType: input.storeType === undefined ? undefined : input.storeType || null,
    plnPowerVa: input.plnPowerVa,
    salesAreaM2: areas?.sales,
    parkingAreaM2: areas?.parkir,
    terraceAreaM2: areas?.teras,
    warehouseAreaM2: areas?.gudang,
    toiletAreaM2: areas?.toilet,
    corridorAreaM2: areas?.selasar,
    is24Hours,
    openTime: is24Hours ? null : input.openTime,
    closeTime: is24Hours ? null : input.closeTime,
  }
}

type TechnicalSource = {
  storeType?: string | null
  type?: string | null
  plnPowerVa: number | null
  salesAreaM2: DecimalLike
  parkingAreaM2: DecimalLike
  terraceAreaM2: DecimalLike
  warehouseAreaM2: DecimalLike
  toiletAreaM2: DecimalLike
  corridorAreaM2: DecimalLike
  is24Hours: boolean | null
  openTime: string | null
  closeTime: string | null
}

function toNumber(value: DecimalLike) {
  return value === null || value === undefined ? 0 : Number(value)
}

// is24Hours is always written with the snapshot, so a null one means a draft saved
// before snapshots existed: those fall back to the store master, as they did before.
export function readDraftTechnical(audit: TechnicalSource, store: TechnicalSource) {
  const source = audit.is24Hours === null ? store : audit
  const is24Hours = Boolean(source.is24Hours)
  return {
    storeType: audit.is24Hours === null ? store.type ?? null : audit.storeType ?? null,
    is24Hours,
    openTime: source.openTime || "07:00",
    closeTime: source.closeTime || "22:00",
    plnPowerVa: source.plnPowerVa ?? store.plnPowerVa ?? 0,
    areas: {
      sales: toNumber(source.salesAreaM2),
      parkir: toNumber(source.parkingAreaM2),
      teras: toNumber(source.terraceAreaM2),
      gudang: toNumber(source.warehouseAreaM2),
      toilet: toNumber(source.toiletAreaM2),
      selasar: toNumber(source.corridorAreaM2),
    },
  }
}
