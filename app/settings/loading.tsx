import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header variant="title-only" title="Pengaturan" />

      <div className="mt-2 flex flex-col gap-6">

        {/* Tampilan skeleton */}
        <section>
          {/* Section label */}
          <Skeleton className="mb-2 h-3 w-20 rounded" />
          {/* Theme picker 3 cols */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[74px] rounded-xl" />
            ))}
          </div>
        </section>

        {/* Informasi skeleton */}
        <section>
          <Skeleton className="mb-2 h-3 w-20 rounded" />
          <Skeleton className="h-[52px] w-full rounded-xl" />
        </section>

        {/* Akun skeleton */}
        <section>
          <Skeleton className="mb-2 h-3 w-16 rounded" />
          <Skeleton className="h-[52px] w-full rounded-xl" />
        </section>

      </div>
    </div>
  )
}
