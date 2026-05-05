import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function AuditStartLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header variant="dashboard-back" title="Mulai Audit Baru" backHref="/dashboard" className="px-0" />
      <main className="flex flex-col gap-8 mt-5">
        <section className="flex flex-col gap-4">
          {/* AuditStepIndicator Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-32 mt-2" />
          {/* Combobox Skeleton */}
          <Skeleton className="h-10 w-full rounded-md" />
        </section>
        
        {/* Placeholder for the rest of the form that appears after selection */}
        <section className="flex flex-col gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </section>
      </main>
      
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 backdrop-blur">
        <div className="w-full max-w-sm">
          <Skeleton className="h-11 w-full rounded-4xl" />
        </div>
      </div>
    </div>
  )
}
