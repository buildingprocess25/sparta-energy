import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-36">
      <Header variant="title-only" title="Settings" className="px-0" />
      <main className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  )
}
