import type { ReactNode } from "react"

export function StepActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
      <div className="flex w-full max-w-sm gap-2">{children}</div>
    </div>
  )
}
