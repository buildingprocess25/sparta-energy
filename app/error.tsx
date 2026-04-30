"use client"

import { IconAlertTriangle } from "@tabler/icons-react"

import { StateBlock } from "@/components/state-block"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-svh bg-background">
      <StateBlock
        title="Ups! Terjadi kesalahan pada tampilan."
        description="Silakan muat ulang layar untuk mencoba lagi."
        icon={IconAlertTriangle}
        action={{ label: "Muat Ulang Layar", onClick: reset }}
      />
    </main>
  )
}
