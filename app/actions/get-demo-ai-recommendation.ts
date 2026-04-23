"use server"

import { generateRecommendationWithFallback } from "@/lib/ai-recommendation"
import type { RecommendationType } from "@prisma/client"

export async function getDemoAiRecommendation(
  auditSummary: string,
  fallbackType: RecommendationType
) {
  try {
    const aiResult = await generateRecommendationWithFallback(auditSummary)
    return { data: aiResult }
  } catch (error) {
    console.error("[Demo AI] AI Recommendation failed. Using static fallback.", error)
    
    const recMap: Record<string, { title: string; description: string }> = {
      TRAINING: {
        title: "Pelatihan SOP Operasional",
        description: "Ditemukan indikasi alat beroperasi melebihi jam buka toko. Rekomendasi: lakukan training SOP kepada karyawan untuk memastikan alat dimatikan sesuai jadwal toko.",
      },
      REPAIR: {
        title: "Perbaikan & Pengecekan Peralatan",
        description: "Konsumsi listrik aktual melebihi estimasi peralatan meskipun jam operasional wajar. Rekomendasi: lakukan pengecekan fisik peralatan (kompresor, kabel) untuk indikasi bocor arus.",
      },
      MAINTENANCE: {
        title: "Pertahankan Efisiensi",
        description: "Konsumsi listrik toko berada dalam ambang batas normal. Lanjutkan kebiasaan operasional yang baik dan lakukan pengecekan rutin.",
      },
    }
    
    const fallbackData = recMap[fallbackType] ?? recMap["MAINTENANCE"]
    
    return {
      data: {
        type: fallbackType,
        title: fallbackData.title,
        description: fallbackData.description,
      }
    }
  }
}
