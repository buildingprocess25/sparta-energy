import type { RecommendationType } from "@prisma/client"

import type { AiRecommendationResponse } from "@/lib/ai-recommendation"

const FALLBACK_TEXT: Record<RecommendationType, { title: string; description: string }> = {
  TRAINING: {
    title: "Pelatihan SOP Operasional",
    description:
      "Ditemukan indikasi alat beroperasi melebihi jam buka toko. Rekomendasi: lakukan training SOP kepada karyawan untuk memastikan alat dimatikan sesuai jadwal toko.",
  },
  REPAIR: {
    title: "Perbaikan & Pengecekan Peralatan",
    description:
      "Konsumsi listrik aktual melebihi estimasi peralatan meskipun jam operasional wajar. Rekomendasi: lakukan pengecekan fisik peralatan (kompresor, kabel) untuk indikasi bocor arus.",
  },
  MAINTENANCE: {
    title: "Pertahankan Efisiensi",
    description:
      "Konsumsi listrik toko berada dalam ambang batas normal. Lanjutkan kebiasaan operasional yang baik dan lakukan pengecekan rutin.",
  },
}

// Fixed text used when every AI model fails; an unknown type falls back to MAINTENANCE.
export function getFallbackRecommendation(type: string): AiRecommendationResponse {
  const key: RecommendationType = type in FALLBACK_TEXT ? (type as RecommendationType) : "MAINTENANCE"
  return { type: key, ...FALLBACK_TEXT[key] }
}
