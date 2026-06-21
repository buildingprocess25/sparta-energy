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

