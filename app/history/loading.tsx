import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"
import { Item, ItemActions, ItemContent } from "@/components/ui/item"

export default function HistoryLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-36">
      <Header variant="title-only" title="Audit History" className="px-0" />
      <main className="space-y-6">
        <div className="relative">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
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
      </main>
    </div>
  )
}
