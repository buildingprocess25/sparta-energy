"use client"

import * as React from "react"
import { IconCamera, IconPhotoUp, IconX } from "@tabler/icons-react"
import { toast } from "sonner"

import { WebcamCapture } from "@/components/energy-audit/webcam-capture"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { compressImage } from "@/lib/image-compression"
import { uploadFiles } from "@/lib/uploadthing"
import { slugify } from "@/lib/utils"

type PhotoUploadFieldProps = {
  id: string
  label: string
  hint?: string
  value: string
  onChange: (url: string) => void
  endpoint: "customEquipmentImage" | "brandImage" | "nameplateImage"
  // Used to name the uploaded file, e.g. the equipment name.
  fileName?: string
  disabled?: boolean
  onUploadingChange?: (uploading: boolean) => void
}

export function PhotoUploadField({
  id,
  label,
  hint,
  value,
  onChange,
  endpoint,
  fileName,
  disabled = false,
  onUploadingChange,
}: PhotoUploadFieldProps) {
  const [uploading, setUploading] = React.useState(false)
  const [webcamOpen, setWebcamOpen] = React.useState(false)
  const cameraInputRef = React.useRef<HTMLInputElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const isBusy = uploading || disabled

  function setUploadingState(next: boolean) {
    setUploading(next)
    onUploadingChange?.(next)
  }

  // Same as Pemeriksaan photos: phones open their own camera from the file
  // input, laptops get the webcam view because desktop browsers ignore capture.
  function openCamera() {
    const hasWebcam =
      window.matchMedia("(pointer: fine)").matches &&
      Boolean(navigator.mediaDevices?.getUserMedia)
    if (hasWebcam) setWebcamOpen(true)
    else cameraInputRef.current?.click()
  }

  async function upload(photo: Blob) {
    setUploadingState(true)
    try {
      const source =
        photo instanceof File ? photo : new File([photo], "foto.jpg", { type: photo.type })
      const compressed = await compressImage(source)
      const renamed = new File(
        [compressed],
        `${slugify(fileName || "equipment")}-${Date.now()}.webp`,
        { type: "image/webp" }
      )
      const res = await uploadFiles(endpoint, { files: [renamed] })
      if (res?.[0]) {
        onChange(res[0].url)
        setWebcamOpen(false)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Foto gagal diunggah. Coba lagi."
      )
    } finally {
      setUploadingState(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-semibold">
        {label}
      </Label>

      {value ? (
        <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl border bg-muted/20">
          <img src={value} alt={label} className="max-h-full max-w-full object-contain" />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-1 right-1 size-11 rounded-full"
            aria-label="Hapus foto"
            onClick={() => onChange("")}
            disabled={disabled}
          >
            <IconX />
          </Button>
        </div>
      ) : webcamOpen ? (
        <WebcamCapture
          pointLabel={label.replace(/\s*\*$/, "")}
          isUploading={uploading}
          onCapture={(photo) => void upload(photo)}
          onCancel={() => setWebcamOpen(false)}
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            <IconPhotoUp data-icon="inline-start" />
            Pilih dari file
          </Button>
          <Button
            id={id}
            type="button"
            className="h-11"
            disabled={isBusy}
            onClick={openCamera}
          >
            {uploading ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <IconCamera data-icon="inline-start" />
            )}
            {uploading ? "Mengunggah foto…" : "Ambil foto"}
          </Button>
        </div>
      )}

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
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ""
            if (file) void upload(file)
          }}
        />
      ))}

      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
