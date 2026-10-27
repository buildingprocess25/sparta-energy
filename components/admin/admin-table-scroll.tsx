import type { ReactNode } from "react"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// Scrolls both ways in one place, so the Table's own overflow-x wrapper is switched
// off: the header stays sticky and the horizontal bar stays on screen.
// A max-h-* on className caps the height; without it, set a height from the parent.
export function AdminTableScroll({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <ScrollArea
      className={cn(
        "[&_[data-slot=scroll-area-thumb]]:bg-muted-foreground/35 [&_[data-slot=table-container]]:overflow-visible [&>[data-slot=scroll-area-viewport]]:max-h-[inherit]",
        className
      )}
    >
      {children}
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
