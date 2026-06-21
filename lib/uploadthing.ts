import { generateReactHelpers } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

// Client-side React helpers/hooks untuk mengunggah file dari frontend
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>()
