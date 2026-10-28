import { BottomNavigation } from "@/components/bottom-navigation"
import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function EnergyAuditListLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md md:max-w-3xl flex-col bg-background px-4 md:px-6 pb-32">
      <Header
        variant="dashboard-back"
        title="Pemeriksaan Energi per Kategori"
        subtitle="Memuat daftar toko..."
        backHref="/dashboard"
      />
      <main className="flex flex-col gap-2" aria-busy="true">
        <Skeleton className="h-11 w-full rounded-xl" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </main>
      <BottomNavigation />
    </div>
  )
}
