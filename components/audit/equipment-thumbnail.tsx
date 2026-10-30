"use client"

import * as React from "react"
import {
  IconBulb,
  IconCpu,
  IconFridge,
  IconSnowflake,
} from "@tabler/icons-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Pencahayaan: IconBulb,
  "Sistem HVAC": IconSnowflake,
  "Sistem Pendingin Produk": IconFridge,
  Lainnya: IconCpu,
}

const SIZES = {
  sm: { box: "size-8 rounded-lg", icon: "size-4" },
  md: { box: "size-10 rounded-xl", icon: "size-5" },
  lg: { box: "size-16 rounded-2xl", icon: "size-7" },
}

type EquipmentThumbnailProps = {
  photoUrl?: string | null
  alt: string
  deviceCategory?: string | null
  size?: keyof typeof SIZES
  // Tap to open the full photo. Only use outside other buttons.
  previewable?: boolean
  className?: string
}

export function EquipmentThumbnail({
  photoUrl,
  alt,
  deviceCategory,
  size = "md",
  previewable = false,
  className,
}: EquipmentThumbnailProps) {
  const [open, setOpen] = React.useState(false)
  const FallbackIcon = CATEGORY_ICONS[deviceCategory ?? ""] ?? IconCpu
  const sizing = SIZES[size]

  const thumbnail = (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden border border-border bg-muted/40",
        sizing.box,
        className
      )}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      ) : (
        <FallbackIcon aria-hidden="true" className={cn(sizing.icon, "text-primary/70")} />
      )}
    </span>
  )

  if (!previewable || !photoUrl) return thumbnail

  return (
    <>
      <button
        type="button"
        aria-label={`Lihat foto ${alt}`}
        onClick={() => setOpen(true)}
        className="-m-1 shrink-0 rounded-2xl p-1 transition-opacity hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {thumbnail}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg overflow-hidden">
          <DialogHeader>
            <DialogTitle className="truncate">{alt}</DialogTitle>
            <DialogDescription className="sr-only">
              Foto produk dari master equipment
            </DialogDescription>
          </DialogHeader>
          <div className="flex min-h-[240px] items-center justify-center rounded-lg border bg-muted/20 p-2">
            <img
              src={photoUrl}
              alt={alt}
              className="max-h-[60vh] w-auto max-w-full rounded-md object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
