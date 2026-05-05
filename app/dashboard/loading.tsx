import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header variant="dashboard" title="Memuat..." subtitle="Tunggu sebentar..." />

      <main className="flex flex-col gap-4 mt-2">
        {/* Hero Card */}
        <Card className="bg-muted/10 shadow-none">
          <CardHeader className="space-y-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </CardHeader>
          <CardFooter>
            <Skeleton className="h-10 w-full rounded-full" />
          </CardFooter>
        </Card>

        {/* AC Estimation Card */}
        <Card className="border-blue-100/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-16 rounded-full shrink-0" />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Recent Audit Section */}
      <section className="flex flex-col gap-5 mt-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
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
