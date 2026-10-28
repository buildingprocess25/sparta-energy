"use client"

import { useRef, useState } from "react"
import { IconCamera, IconPhotoUp, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { WebcamCapture } from "@/components/energy-audit/webcam-capture"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import {
  MAX_PHOTOS_PER_LUX_ROW,
  type LightingLuxPhoto,
  type LightingZoneKey,
} from "@/lib/lighting-audit"

const PHOTO_ROUTE = "/api/energy-audit/photos"
const MAX_SIDE_PX = 1600

export type LuxPhotoContext = {
  sourceAuditId: string
  zone: LightingZoneKey
}

type LuxRowPhotosProps = {
  context: LuxPhotoContext
  // Shown to people, e.g. "A1" or "titik 2"
  pointLabel: string
  // Used in the file name, e.g. "A1" or "T2"
  pointCode: string
  zoneLabel: string
  photos: LightingLuxPhoto[]
  // The point has a lux value but no photo yet
  missing: boolean
  onChange: (photos: LightingLuxPhoto[]) => void
}

function photoUrl(photo: LightingLuxPhoto) {
  const params = new URLSearchParams({
    storage: photo.storage,
    ref: photo.ref,
    sig: photo.sig,
  })
  return `${PHOTO_ROUTE}?${params}`
}

// Phone photos are 3 to 8 MB; shrinking to 1600 px keeps uploads quick on store signal.
async function compressPhoto(file: Blob): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(
      1,
      MAX_SIDE_PX / Math.max(bitmap.width, bitmap.height)
    )
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas
      .getContext("2d")
      ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8)
    )
    return blob ?? file
  } catch {
    return file
  }
}

export function LuxRowPhotos({
  context,
  pointLabel,
  pointCode,
  zoneLabel,
  photos,
  missing,
  onChange,
}: LuxRowPhotosProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [webcamOpen, setWebcamOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [confirmRef, setConfirmRef] = useState<string | null>(null)
  const [deletingRef, setDeletingRef] = useState<string | null>(null)
  const isFull = photos.length >= MAX_PHOTOS_PER_LUX_ROW

  // Phones open their own camera from the file input; laptops need the webcam view.
  function openCamera() {
    const hasWebcam =
      window.matchMedia("(pointer: fine)").matches &&
      Boolean(navigator.mediaDevices?.getUserMedia)
    if (hasWebcam) setWebcamOpen(true)
    else cameraInputRef.current?.click()
  }

  async function upload(file: Blob) {
    setIsUploading(true)
    try {
      const body = new FormData()
      body.set("sourceAuditId", context.sourceAuditId)
      body.set("zone", context.zone)
      body.set("point", pointCode)
      body.set("file", await compressPhoto(file), "foto.jpg")
      const response = await fetch(PHOTO_ROUTE, { method: "POST", body })
      const payload = (await response.json()) as {
        photo?: LightingLuxPhoto
        error?: string
      }
      if (!response.ok || !payload.photo) {
        throw new Error(payload.error)
      }
      onChange([...photos, payload.photo])
      setWebcamOpen(false)
      toast.success(`Foto ${pointLabel} tersimpan. Simpan draf agar tercatat.`)
    } catch {
      toast.error(
        `Foto ${pointLabel} gagal diunggah. Periksa sinyal, lalu coba lagi.`
      )
    } finally {
      setIsUploading(false)
    }
  }

  async function remove(photo: LightingLuxPhoto) {
    setDeletingRef(photo.ref)
    try {
      const response = await fetch(photoUrl(photo), { method: "DELETE" })
      if (!response.ok) throw new Error()
      onChange(photos.filter((item) => item.ref !== photo.ref))
      setConfirmRef(null)
    } catch {
      toast.error(`Foto ${pointLabel} gagal dihapus. Coba lagi.`)
    } finally {
      setDeletingRef(null)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-11"
        aria-label={`Foto ${pointLabel} ${zoneLabel}, ${photos.length} foto`}
        aria-invalid={missing || undefined}
        onClick={() => setOpen(true)}
      >
        <IconCamera data-icon="inline-start" />
        {photos.length === 0 ? "Foto" : `${photos.length} foto`}
      </Button>

      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) {
            setConfirmRef(null)
            setWebcamOpen(false)
          }
        }}
      >
        <SheetContent
          side="bottom"
          className="mx-auto w-full max-w-lg rounded-t-2xl"
        >
          <SheetHeader>
            <SheetTitle>Foto {pointLabel}</SheetTitle>
            <SheetDescription>
              {zoneLabel}. Maksimal {MAX_PHOTOS_PER_LUX_ROW} foto per titik.
            </SheetDescription>
          </SheetHeader>

          <div className="px-4">
            {webcamOpen ? (
              <WebcamCapture
                pointLabel={pointLabel}
                isUploading={isUploading}
                onCapture={(blob) => void upload(blob)}
                onCancel={() => setWebcamOpen(false)}
              />
            ) : photos.length === 0 ? (
              <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                Belum ada foto untuk {pointLabel}.
              </p>
            ) : (
              <ul className="grid grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <li key={photo.ref} className="flex flex-col gap-1.5">
                    <a
                      href={photoUrl(photo)}
                      target="_blank"
                      rel="noreferrer"
                      className="block aspect-square overflow-hidden rounded-lg bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                      aria-label={`Buka foto ${index + 1} ${pointLabel}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- served by our auth-checked route, not next/image */}
                      <img
                        src={photoUrl(photo)}
                        alt={`Foto ${index + 1} ${pointLabel}`}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 text-destructive hover:text-destructive"
                      aria-label={`Hapus foto ${index + 1} ${pointLabel}`}
                      onClick={() => setConfirmRef(photo.ref)}
                    >
                      <IconTrash data-icon="inline-start" />
                      Hapus
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {confirmRef && (
              <div
                role="alertdialog"
                aria-label={`Hapus foto dari ${pointLabel}`}
                className="mt-3 flex flex-col gap-2 rounded-xl border p-3 text-sm"
              >
                <p>Hapus foto ini dari {pointLabel}?</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => setConfirmRef(null)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="h-11"
                    disabled={deletingRef !== null}
                    onClick={() => {
                      const photo = photos.find(
                        (item) => item.ref === confirmRef
                      )
                      if (photo) void remove(photo)
                    }}
                  >
                    {deletingRef ? <Spinner data-icon="inline-start" /> : null}
                    Hapus foto
                  </Button>
                </div>
              </div>
            )}
          </div>

          {!webcamOpen && (
            <SheetFooter>
              {[
                { ref: cameraInputRef, capture: true },
                { ref: fileInputRef, capture: false },
              ].map(({ ref, capture }) => (
                <input
                  key={capture ? "camera" : "file"}
                  ref={ref}
                  type="file"
                  accept="image/*"
                  capture={capture ? "environment" : undefined}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ""
                    if (file) void upload(file)
                  }}
                />
              ))}
              {isFull ? (
                <p className="text-center text-sm text-muted-foreground">
                  Sudah {MAX_PHOTOS_PER_LUX_ROW} foto. Hapus satu untuk
                  mengganti.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <IconPhotoUp data-icon="inline-start" />
                    Pilih dari file
                  </Button>
                  <Button
                    type="button"
                    className="h-11"
                    disabled={isUploading}
                    onClick={openCamera}
                  >
                    {isUploading ? (
                      <Spinner data-icon="inline-start" />
                    ) : (
                      <IconCamera data-icon="inline-start" />
                    )}
                    {isUploading ? "Mengunggah foto…" : "Ambil foto"}
                  </Button>
                </div>
              )}
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
