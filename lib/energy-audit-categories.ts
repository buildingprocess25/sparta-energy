import type { EnergyAuditCategory, EnergyAuditStatus } from "@prisma/client"

export type EnergyAuditCategoryInfo = {
  key: EnergyAuditCategory
  slug: string
  label: string
  description: string
  available: boolean
}

// Order and names follow the "Aplikasi Audit Energy by Kategori" plan in Notion.
export const ENERGY_AUDIT_CATEGORIES: EnergyAuditCategoryInfo[] = [
  {
    key: "TATA_CAHAYA",
    slug: "tata-cahaya",
    label: "Sistem Tata Cahaya",
    description: "Kepadatan daya lampu dan tingkat terang per zona.",
    available: true,
  },
  {
    key: "TATA_UDARA_VENTILASI",
    slug: "tata-udara",
    label: "Sistem Tata Udara & Ventilasi",
    description: "Kecukupan AC, suhu ruang, filter, dan exhaust fan.",
    available: true,
  },
  {
    key: "REFRIGERASI",
    slug: "refrigerasi",
    label: "Sistem Refrigerasi",
    description: "Suhu chiller dan freezer, karet pintu, kondensor.",
    available: false,
  },
  {
    key: "SELUBUNG_BANGUNAN",
    slug: "selubung-bangunan",
    label: "Sistem Selubung Bangunan",
    description: "Kaca, pintu, atap, dan panas yang masuk ke toko.",
    available: false,
  },
  {
    key: "KELISTRIKAN",
    slug: "kelistrikan",
    label: "Sistem Kelistrikan",
    description: "Daya PLN, beban per fase, power factor, kondisi panel.",
    available: false,
  },
  {
    key: "BEBAN_PASIF_STOPKONTAK",
    slug: "beban-pasif",
    label: "Sistem Beban Daya Pasif & Stopkontak",
    description: "Alat yang tetap menyala saat tidak dipakai.",
    available: false,
  },
  {
    key: "BEANSPOT",
    slug: "beanspot",
    label: "Sistem Beanspot",
    description: "Mesin kopi dan pendukungnya, jam nyala, mode standby.",
    available: false,
  },
]

// Categories whose form is live; lists, counts and exports follow this, so opening a
// category is a one-line change above.
export const AVAILABLE_ENERGY_AUDIT_CATEGORIES = ENERGY_AUDIT_CATEGORIES.filter(
  (category) => category.available
)

export type EnergyAuditCategoryProgress = {
  key: EnergyAuditCategory
  label: string
  status: EnergyAuditStatus | null
  summaryStatus: string | null
}

// Per-category status as the list query returns it (jsonb keyed by category).
export type CategoryStatusMap = Record<
  string,
  { status: EnergyAuditStatus; summaryStatus: string | null }
>

// One entry per available category, in menu order; categories without a form are left out.
export function toCategoryProgress(
  statuses: CategoryStatusMap | null
): EnergyAuditCategoryProgress[] {
  return AVAILABLE_ENERGY_AUDIT_CATEGORIES.map((category) => ({
    key: category.key,
    label: category.label,
    status: statuses?.[category.key]?.status ?? null,
    summaryStatus: statuses?.[category.key]?.summaryStatus ?? null,
  }))
}
