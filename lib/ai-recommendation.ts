import { GoogleGenAI, Type, Schema } from "@google/genai"
import type { RecommendationType } from "@prisma/client"

// Initialize with environment variable GEMINI_API_KEY
const getAiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.")
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
}

// Waterfall array
const MODEL_WATERFALL = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemma-4-31b",
  "gemma-4-26b",
  "gemma-3-27b",
  "gemma-3-12b",
  "gemma-3-4b",
  "gemma-3-2b",
  "gemma-3-1b",
]

export type AiRecommendationResponse = {
  type: RecommendationType
  title: string
  description: string
}

export async function generateRecommendationWithFallback(
  auditSummary: string
): Promise<AiRecommendationResponse> {
  const ai = getAiClient()

  const systemInstruction = `Kamu adalah ahli audit energi bersertifikat. 
Tugasmu adalah menganalisis ringkasan data audit listrik sebuah toko ritel/minimarket dan memberikan 1 rekomendasi utama yang paling relevan.

Aturan Penentuan Tipe Rekomendasi (Pilih salah satu):
- "MAINTENANCE": Jika status toko dinilai HEMAT (Konsumsi Aktual <= Estimasi). Rekomendasikan untuk mempertahankan efisiensi.
- "TRAINING": Jika toko dinilai BOROS dan kamu melihat indikasi alat (terutama AC) menyala jauh melebihi jam operasional toko (indikasi lupa dimatikan / kelalaian staf).
- "REPAIR": Jika toko dinilai BOROS namun jam menyala alat sesuai jadwal (tidak ada indikasi kelalaian besar). Ini berarti ada alat yang usang, rusak, kompresor melemah, atau kebocoran arus listrik.

Deskripsi harus profesional, langsung pada intinya (maks 3 kalimat), dan mudah dipahami oleh staf toko awam.`

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        enum: ["TRAINING", "REPAIR", "MAINTENANCE"],
        description: "Kategori rekomendasi",
      },
      title: {
        type: Type.STRING,
        description:
          "Judul rekomendasi singkat, jelas, profesional (contoh: 'Pelatihan SOP Operasional AC')",
      },
      description: {
        type: Type.STRING,
        description:
          "Isi rekomendasi. Jelaskan MASALAH yang ditemukan dari data dan SOLUSI yang harus dilakukan. Maksimal 3 kalimat.",
      },
    },
    required: ["type", "title", "description"],
  }

  // Iterate over models until one succeeds
  for (const model of MODEL_WATERFALL) {
    try {
      console.log(`[AI Recommendation] Attempting with model: ${model}...`)
      const response = await ai.models.generateContent({
        model: model,
        contents: auditSummary,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.3, // Low temp for more deterministic output
        },
      })

      const text = response.text
      if (!text) throw new Error("Empty response from AI")

      const parsed = JSON.parse(text) as AiRecommendationResponse

      // Ensure type is valid against Prisma Enum
      if (!["TRAINING", "REPAIR", "MAINTENANCE"].includes(parsed.type)) {
        parsed.type = "MAINTENANCE"
      }

      console.log(`[AI Recommendation] Success with model: ${model}`)
      return parsed
    } catch (error) {
      console.warn(
        `[AI Recommendation] Model ${model} failed:`,
        error instanceof Error ? error.message : "Unknown error"
      )
      // Continue to next model in the waterfall
    }
  }

  // If ALL models failed, throw error to trigger the hardcoded fail-safe in submit-audit.ts
  throw new Error(
    "All AI models in the waterfall failed to generate a recommendation."
  )
}
