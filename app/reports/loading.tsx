import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReportsLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-36">
      <Header variant="title-only" title="Reports" />
      <main className="space-y-6">
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="space-y-4">
          <Skeleton className="h-50 w-full rounded-xl" />
          <Skeleton className="h-50 w-full rounded-xl" />
        </div>
      </main>
    </div>
  )
}
