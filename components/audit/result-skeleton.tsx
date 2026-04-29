import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function AuditResultSkeleton() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-36">
      <Header
        variant="title-only"
        title="Hasil Audit Energi"
        className="px-0"
      />
      <main className="space-y-4">
        {/* 1. Status Card */}
        <Card className="border-0 bg-muted/20 shadow-lg">
          <CardContent>
            <div className="space-y-4 pt-6">
              <Skeleton className="h-5 w-36 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-44" />
              </div>
              <div className="grid grid-cols-2 gap-3 border-t pt-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Rekomendasi */}
        <div className="space-y-2">
          <div className="ml-1 flex items-center justify-between">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <div className="rounded-xl border p-3.5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <Skeleton className="mt-2.5 h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* 3. Perbandingan kWh */}
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-11 w-full rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 4. Trend Chart */}
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* 5. Pie Chart */}
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-36" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="size-44 rounded-full" />
              <div className="w-full space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-2.5 shrink-0 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. Daftar Peralatan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-1.5">
                {[64, 48, 56, 52].map((w, i) => (
                  <Skeleton
                    key={i}
                    className="h-6 rounded-full"
                    style={{ width: w }}
                  />
                ))}
              </div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
                >
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
