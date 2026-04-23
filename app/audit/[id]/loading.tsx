import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AuditResultLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-36">
      <Header variant="title-only" title="Hasil Audit Energi" className="px-0" />
      <main className="space-y-4">
        {/* Status Card Skeleton */}
        <Card className="border-0 shadow-lg">
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-5 w-32 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t pt-4">
              <div className="space-y-2">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>

        {/* Area Details Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56 mt-1" />
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <Skeleton className="size-40 rounded-full" />
            <div className="w-full space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-3 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
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
