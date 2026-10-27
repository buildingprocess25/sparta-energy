"use client"

import { useEffect, useRef, useState } from "react"
import { IconCamera, IconRefresh } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

const MAX_SIDE_PX = 1600

type WebcamCaptureProps = {
  pointLabel: string
  isUploading: boolean
  onCapture: (photo: Blob) => void
  onCancel: () => void
}

// Desktop browsers ignore <input capture>, so laptops take the photo here.
export function WebcamCapture({
  pointLabel,
  isUploading,
  onCapture,
  onCancel,
}: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<"starting" | "live" | "error">(
    "starting"
  )
  const [shot, setShot] = useState<{ blob: Blob; url: string } | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "environment", width: { ideal: MAX_SIDE_PX } },
        audio: false,
      })
      .then((media) => {
        if (cancelled) {
          media.getTracks().forEach((track) => track.stop())
          return
        }
        stream = media
        if (videoRef.current) videoRef.current.srcObject = media
        setStatus("live")
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })

    return () => {
      cancelled = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(
    () => () => {
      if (shot) URL.revokeObjectURL(shot.url)
    },
    [shot]
  )

  function takeShot() {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return
    const scale = Math.min(
      1,
      MAX_SIDE_PX / Math.max(video.videoWidth, video.videoHeight)
    )
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (blob) setShot({ blob, url: URL.createObjectURL(blob) })
      },
      "image/jpeg",
      0.85
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col gap-3">
        <p
          role="alert"
          className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground"
        >
          Kamera tidak bisa dibuka. Izinkan akses kamera di browser, atau pilih
          foto dari file.
        </p>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={onCancel}
        >
          Kembali
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-muted">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-label={`Kamera untuk foto ${pointLabel}`}
          className={shot ? "hidden" : "size-full object-cover"}
        />
        {shot && (
          // eslint-disable-next-line @next/next/no-img-element -- local preview blob
          <img
            src={shot.url}
            alt={`Hasil foto ${pointLabel}`}
            className="size-full object-cover"
          />
        )}
        {status === "starting" && (
          <p className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Membuka kamera…
          </p>
        )}
      </div>

      {shot ? (
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={isUploading}
            onClick={() => setShot(null)}
          >
            <IconRefresh data-icon="inline-start" />
            Ulangi
          </Button>
          <Button
            type="button"
            className="h-11"
            disabled={isUploading}
            onClick={() => onCapture(shot.blob)}
          >
            {isUploading && <Spinner data-icon="inline-start" />}
            {isUploading ? "Mengunggah foto…" : "Pakai foto"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={onCancel}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="h-11"
            disabled={status !== "live"}
            onClick={takeShot}
          >
            <IconCamera data-icon="inline-start" />
            Jepret
          </Button>
        </div>
      )}
    </div>
  )
}
