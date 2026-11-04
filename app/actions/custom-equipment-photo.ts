"use server"

import { headers } from "next/headers"

import { deleteUploadThingFile } from "@/lib/admin-master-data-mutations"
import { auth } from "@/lib/auth"
import { isUploadThingUrl } from "@/lib/custom-equipment"
import { prisma } from "@/lib/prisma"
import { fileKeyFromUrl, verifyDiscardToken } from "@/lib/upload-discard-token"

// Deletes a Tambah Alat Kustom photo the store staff uploaded and then dropped.
// Failures stay silent for the user: the form already moved on.
export async function discardCustomEquipmentPhoto(input: { url: string; token: string }) {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret || !isUploadThingUrl(input.url) || !input.token) return

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return

  const fileKey = fileKeyFromUrl(input.url)
  if (!fileKey || !verifyDiscardToken(input.token, fileKey, session.user.id, secret)) {
    return
  }

  // A saved draft or an approved brand may already point at this photo.
  const [submission, brand] = await Promise.all([
    prisma.customEquipmentSubmission.findFirst({
      where: { productPhotoUrl: { endsWith: `/${fileKey}` } },
      select: { id: true },
    }),
    prisma.equipmentBrand.findFirst({
      where: { productPhotoUrl: { endsWith: `/${fileKey}` } },
      select: { id: true },
    }),
  ])
  if (submission || brand) return

  await deleteUploadThingFile(input.url)
}
