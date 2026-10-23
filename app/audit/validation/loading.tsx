import { BottomNavigation } from "@/components/bottom-navigation"
import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function AuditValidationLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md md:max-w-3xl flex-col bg-background px-4 md:px-6 pb-32">
      <Header
        variant="dashboard-back"
        title="Validasi Kalkulator Konsumsi Energi Toko"
        subtitle="Memuat daftar toko..."
        backHref="/dashboard"
      />

      <main className="flex flex-col gap-2" aria-busy="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3.5"
          >
            <Skeleton className="size-5 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-14" />
          </div>
        ))}
      </main>

      <BottomNavigation />
    </div>
  )
}
