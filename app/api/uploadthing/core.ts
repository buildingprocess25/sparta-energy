import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"

import { auth } from "@/lib/auth"
import { getEffectiveRole } from "@/lib/current-role"
import { prisma } from "@/lib/prisma"
import { can } from "@/lib/role-access"

const f = createUploadthing()

const imageOnly = {
  image: {
    maxFileSize: "4MB",
    maxFileCount: 1,
  },
} as const

async function requireSignedIn(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) throw new UploadThingError("Sesi berakhir. Silakan login kembali.")
  return session.user.id
}

// Brand photos change the master data, so only Master Data managers may upload them.
async function requireMasterDataManager(req: Request) {
  const userId = await requireSignedIn(req)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  const role = await getEffectiveRole(user?.role)
  if (!can(role, "manageUsers")) {
    throw new UploadThingError("Anda tidak punya akses mengubah master data.")
  }
  return { userId }
}

export const ourFileRouter = {
  brandImage: f(imageOnly, { awaitServerData: false })
    .middleware(({ req }) => requireMasterDataManager(req))
    .onUploadComplete(async ({ file }) => ({ url: file.url })),
  nameplateImage: f(imageOnly, { awaitServerData: false })
    .middleware(({ req }) => requireMasterDataManager(req))
    .onUploadComplete(async ({ file }) => ({ url: file.url })),
  // Product photo from the store's Tambah Alat Kustom form, reviewed by an admin later.
  customEquipmentImage: f(imageOnly, { awaitServerData: false })
    .middleware(async ({ req }) => ({ userId: await requireSignedIn(req) }))
    .onUploadComplete(async ({ file }) => ({ url: file.url })),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
