import type { EnergyAuditCategory } from "@prisma/client"

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
    available: false,
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
