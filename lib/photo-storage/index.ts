import type { LightingLuxPhoto } from "@/lib/lighting-audit"

import {
  readDriveFile,
  resolveDriveFolder,
  trashDriveFile,
  uploadDriveFile,
} from "./drive"
import { deleteLocalFile, readLocalFile, saveLocalFile } from "./local"
import { signPhotoRef } from "./signature"

export const LIGHTING_PHOTO_PATH = ["Audit Energi", "Tata Cahaya"]

type PhotoStore = { code: string; name: string; branch: string | null }

function storageFor(store: PhotoStore): LightingLuxPhoto["storage"] {
  return store.branch?.toUpperCase() === "DEMO" ? "local" : "drive"
}

function safeSegment(value: string) {
  return value.replace(/[^A-Za-z0-9._-]+/g, "_")
}

export async function saveLightingPhoto(input: {
  store: PhotoStore
  dateFolder: string
  fileName: string
  contentType: string
  body: Buffer
}): Promise<LightingLuxPhoto> {
  const storage = storageFor(input.store)
  let ref: string

  if (storage === "local") {
    ref = [
      safeSegment(input.store.code),
      input.dateFolder,
      safeSegment(input.fileName),
    ].join("/")
    await saveLocalFile(ref, input.body)
  } else {
    if (!input.store.branch)
      throw new Error("Store has no branch for the Drive folder")
    const folderId = await resolveDriveFolder(
      {
        code: input.store.code,
        name: input.store.name,
        branch: input.store.branch,
      },
      [...LIGHTING_PHOTO_PATH, input.dateFolder]
    )
    ref = await uploadDriveFile(
      folderId,
      input.fileName,
      input.contentType,
      input.body
    )
  }

  return {
    storage,
    ref,
    sig: signPhotoRef(storage, ref),
    name: input.fileName,
    uploadedAt: new Date().toISOString(),
  }
}

export async function readLightingPhoto(
  photo: Pick<LightingLuxPhoto, "storage" | "ref">
) {
  if (photo.storage === "local") {
    return { body: await readLocalFile(photo.ref), contentType: "image/jpeg" }
  }
  return readDriveFile(photo.ref)
}

export async function deleteLightingPhoto(
  photo: Pick<LightingLuxPhoto, "storage" | "ref">
) {
  if (photo.storage === "local") return deleteLocalFile(photo.ref)
  return trashDriveFile(photo.ref)
}
