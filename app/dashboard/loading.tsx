import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Item, ItemActions, ItemContent } from "@/components/ui/item"

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header variant="dashboard" title="Memuat..." subtitle="Tunggu sebentar..." />
      <main className="flex flex-col gap-8">
        <Card className="bg-muted/10 border-0 shadow-none">
          <CardHeader className="space-y-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </CardHeader>
          <CardFooter>
            <Skeleton className="h-10 w-full rounded-full" />
          </CardFooter>
        </Card>
        
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Item key={i} size="sm" variant="outline">
                <ItemContent className="gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl" />
                  </div>
                </ItemContent>
                <ItemActions className="flex-col items-end self-stretch justify-between">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-2 w-10" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </ItemActions>
              </Item>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
