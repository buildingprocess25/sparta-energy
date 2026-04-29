import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function AcEstimationLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header
        variant="dashboard-back"
        title="Hitung Kebutuhan AC"
        backHref="/dashboard"
        className="px-0"
      />

      <main className="mt-4 flex flex-col gap-6">
        {/* Toko selector */}
        <section className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </section>

        {/* Form fields */}
        <section className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        </section>

        {/* Map area */}
        <section className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-52 w-full rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </section>

        {/* Calculate button */}
        <Skeleton className="h-11 w-full rounded-full" />
      </main>
    </div>
  )
}
