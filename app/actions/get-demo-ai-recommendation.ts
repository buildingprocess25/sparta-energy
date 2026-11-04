"use server"

import { generateRecommendationWithFallback } from "@/lib/ai-recommendation"
import { getFallbackRecommendation } from "@/lib/recommendation-fallback"
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
    return { data: getFallbackRecommendation(fallbackType) }
  }
}
