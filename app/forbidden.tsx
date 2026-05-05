import { IconShieldLock } from "@tabler/icons-react"

import { StateBlock } from "@/components/state-block"

export default function Forbidden() {
  return (
    <main className="min-h-svh bg-background">
      <StateBlock
        title="Akses ditolak"
        description="Anda tidak memiliki izin untuk halaman ini."
        icon={IconShieldLock}
        action={{ label: "Kembali", href: "/", variant: "outline" }}
      />
    </main>
  )
}
