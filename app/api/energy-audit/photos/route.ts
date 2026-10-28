import { getAuditValidator } from "@/lib/audit-validation-access"
import { LIGHTING_ZONES, type LightingLuxPhoto } from "@/lib/lighting-audit"
import {
  deleteLightingPhoto,
  readLightingPhoto,
  saveLightingPhoto,
} from "@/lib/photo-storage"
import { isValidPhotoSig } from "@/lib/photo-storage/signature"
import { prisma } from "@/lib/prisma"

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const POINT_LABEL = /^[A-Z0-9-]{1,12}$/

const jakartaDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})
const jakartaTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
})

function fail(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

function readPhotoParams(request: Request) {
  const params = new URL(request.url).searchParams
  const storage = params.get("storage") === "local" ? "local" : "drive"
  const ref = params.get("ref") ?? ""
  const sig = params.get("sig") ?? ""
  if (!ref || !sig || !isValidPhotoSig(storage, ref, sig)) return null
  return { storage, ref } satisfies Pick<LightingLuxPhoto, "storage" | "ref">
}

export async function POST(request: Request) {
  if (!(await getAuditValidator())) {
    return fail("Anda tidak punya akses untuk pemeriksaan ini.", 403)
  }

  const form = await request.formData()
  const sourceAuditId = String(form.get("sourceAuditId") ?? "")
  const zone = String(form.get("zone") ?? "")
  const point = String(form.get("point") ?? "").toUpperCase()
  const file = form.get("file")

  if (
    !LIGHTING_ZONES.some((item) => item.key === zone) ||
    !POINT_LABEL.test(point)
  ) {
    return fail("Zona atau titik foto tidak dikenal.", 400)
  }
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return fail("File harus berupa foto.", 400)
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return fail("Ukuran foto paling besar 5 MB.", 413)
  }

  const source = await prisma.audit.findUnique({
    where: { id: sourceAuditId },
    select: {
      status: true,
      validationStatus: true,
      store: { select: { code: true, name: true, branch: true } },
    },
  })
  if (
    !source ||
    source.status !== "COMPLETED" ||
    source.validationStatus !== "VALIDATED"
  ) {
    return fail(
      "Kalkulasi toko ini belum divalidasi, jadi belum bisa diperiksa.",
      400
    )
  }

  const now = new Date()
  const time = jakartaTime.format(now).replace(/:/g, "")
  const suffix = crypto.randomUUID().slice(0, 4)
  try {
    const photo = await saveLightingPhoto({
      store: source.store,
      dateFolder: jakartaDate.format(now),
      fileName: `${zone}_${point}_${time}_${suffix}.jpg`,
      contentType: file.type,
      body: Buffer.from(await file.arrayBuffer()),
    })
    return Response.json({ photo })
  } catch (error) {
    console.error("[Energy Audit Photo] Upload failed", error)
    return fail("Foto gagal disimpan. Coba lagi.", 502)
  }
}

export async function GET(request: Request) {
  if (!(await getAuditValidator())) return fail("Tidak punya akses.", 403)
  const photo = readPhotoParams(request)
  if (!photo) return fail("Foto tidak ditemukan.", 404)

  try {
    const file = await readLightingPhoto(photo)
    const body =
      file.body instanceof Buffer ? new Uint8Array(file.body) : file.body
    return new Response(body, {
      headers: {
        "content-type": file.contentType,
        "cache-control": "private, max-age=86400, immutable",
      },
    })
  } catch (error) {
    console.error("[Energy Audit Photo] Read failed", error)
    return fail("Foto tidak bisa dibuka.", 502)
  }
}

export async function DELETE(request: Request) {
  if (!(await getAuditValidator())) return fail("Tidak punya akses.", 403)
  const photo = readPhotoParams(request)
  if (!photo) return fail("Foto tidak ditemukan.", 404)

  try {
    await deleteLightingPhoto(photo)
    return Response.json({ ok: true })
  } catch (error) {
    console.error("[Energy Audit Photo] Delete failed", error)
    return fail("Foto gagal dihapus. Coba lagi.", 502)
  }
}
