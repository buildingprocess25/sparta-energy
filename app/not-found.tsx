import { IconFileUnknown } from "@tabler/icons-react"

import { StateBlock } from "@/components/state-block"

export default function NotFound() {
  return (
    <main className="min-h-svh bg-background">
      <StateBlock
        title="Halaman atau data tidak ditemukan"
        description="Tautan yang Anda akses mungkin sudah tidak tersedia."
        icon={IconFileUnknown}
        action={{ label: "Kembali", href: "/", variant: "outline" }}
      />
    </main>
  )
}
