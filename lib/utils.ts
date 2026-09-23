import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")        // Ganti spasi dengan -
    .replace(/[^\w\-]+/g, "")     // Hapus karakter non-word selain -
    .replace(/\-\-+/g, "-")       // Ganti beberapa - berurutan dengan satu -
    .replace(/^-+/, "")           // Hapus - di awal
    .replace(/-+$/, "")           // Hapus - di akhir
}

/**
 * Format string identitas toko untuk penamaan file unduhan (AC, Lampu, Denah, dll)
 * Output bersih dalam format slug kebab-case.
 * Contoh:
 * - { code: "TB01", name: "Pangkalan Jati", branch: "BOGOR" } => "tb01-pangkalan-jati-bogor"
 * - { code: "", name: "Pangkalan Jati", branch: "BOGOR" } => "pangkalan-jati-bogor"
 * - { code: "ABC1", name: "ABC1 Sparta Mart", branch: "JAKARTA" } => "abc1-sparta-mart-jakarta"
 * - { code: "", name: "", branch: "" } => "toko"
 */
export function formatStoreFilenameIdentity(store?: {
  code?: string | null
  name?: string | null
  branch?: string | null
}): string {
  if (!store) return "toko"

  const parts: string[] = []
  const cleanCode = (store.code || "").trim()
  const cleanName = (store.name || "").trim()
  const cleanBranch = (store.branch || "").trim()

  const codeSlug = slugify(cleanCode)
  if (codeSlug) {
    parts.push(codeSlug)
  }

  let nameSlug = slugify(cleanName)
  if (nameSlug) {
    // Hindari duplikasi jika kode toko sudah ada di awal nama toko
    if (codeSlug && nameSlug.startsWith(codeSlug + "-")) {
      nameSlug = nameSlug.slice(codeSlug.length + 1)
    } else if (codeSlug && nameSlug === codeSlug) {
      nameSlug = ""
    }
    if (nameSlug) {
      parts.push(nameSlug)
    }
  }

  const branchSlug = slugify(cleanBranch)
  if (branchSlug) {
    // Hindari duplikasi jika cabang sudah tertulis dalam nama toko
    if (!parts.some((p) => p.includes(branchSlug))) {
      parts.push(branchSlug)
    }
  }

  if (parts.length === 0) {
    return "toko"
  }

  return parts.filter(Boolean).join("-")
}

/**
 * Membuat nama file hasil kalkulator/estimasi yang lengkap, rapi, dan deskriptif.
 * Format: `[prefix]-[identitas-toko]-[YYYYMMDD].[extension]`
 * Contoh:
 * - `estimasi-ac-pangkalan-jati-bogor-20260923.png`
 * - `estimasi-lampu-tb01-merdeka-bogor-20260923.png`
 * - `mapping-ac-pangkalan-jati-bekasi-20260923.png`
 */
export function generateCalculationFilename({
  prefix,
  store,
  date = new Date(),
  extension = "png",
}: {
  prefix: string
  store?: {
    code?: string | null
    name?: string | null
    branch?: string | null
  }
  date?: Date
  extension?: string
}): string {
  const identity = formatStoreFilenameIdentity(store)
  const d = date
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const dateStr = `${yyyy}${mm}${dd}`

  return `${prefix}-${identity}-${dateStr}.${extension}`
}


