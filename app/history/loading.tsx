import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function HistoryLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header variant="title-only" title="Riwayat Audit" />

      <section className="space-y-4">
        {/* Search bar */}
        <Skeleton className="h-10 w-full rounded-md" />

        {/* Filters — 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>

        {/* AuditCard rows */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border bg-card px-3 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BottomNavigation />
    </div>
  )
}
