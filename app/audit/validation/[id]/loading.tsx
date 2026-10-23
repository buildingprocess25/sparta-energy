import { Header } from "@/components/header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AuditValidationDetailLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md md:max-w-5xl lg:max-w-7xl flex-col bg-background px-4 md:px-6 lg:px-8 pb-36">
      <Header
        variant="dashboard-back"
        title="Validasi Kalkulasi"
        subtitle="Memuat data toko..."
        backHref="/audit/validation"
      />

      <main className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12" aria-busy="true">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <Skeleton className="h-52 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
        <Card className="lg:col-span-7">
          <CardHeader>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-11 w-full rounded-full" />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
