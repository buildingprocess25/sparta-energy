"use client"

import { IconAlertTriangle } from "@tabler/icons-react"

import { StateBlock } from "@/components/state-block"

export default function EnergyAuditError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-svh bg-background">
      <StateBlock
        title="Data pemeriksaan gagal dimuat."
        description="Muat ulang halaman untuk mencoba lagi."
        icon={IconAlertTriangle}
        action={{ label: "Muat Ulang", onClick: reset }}
      />
    </main>
  )
}
