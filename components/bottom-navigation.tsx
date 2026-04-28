"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconHistory,
  IconLayoutDashboard,
  IconMenu2,
} from "@tabler/icons-react"
import * as React from "react"

import { cn } from "@/lib/utils"

type BottomNavigationItem = "dashboard" | "history" | "settings"

type BottomNavigationProps = {
  activeItem?: BottomNavigationItem
}

const navItems: Array<{
  key: BottomNavigationItem
  label: string
  href: string
  icon: React.ComponentType<React.ComponentProps<"svg">>
}> = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: IconLayoutDashboard,
  },
  {
    key: "history",
    label: "Riwayat",
    href: "/history",
    icon: IconHistory,
  },
  {
    key: "settings",
    label: "Pengaturan",
    href: "/settings",
    icon: IconMenu2,
  },
]

function BottomNavigation({ activeItem }: BottomNavigationProps) {
  const pathname = usePathname()

  const resolvedActiveItem =
    activeItem ??
    navItems.find((item) => item.href === pathname)?.key ??
    "dashboard"

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <nav className="pointer-events-auto w-full max-w-sm rounded-t-3xl border-t border-border/70 bg-background/80 px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_rgba(26,28,25,0.06)] backdrop-blur-md">
        <ul className="flex items-center justify-around gap-1">
          {navItems.map((item) => {
            const isActive = item.key === resolvedActiveItem
            const Icon = item.icon

            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-20 flex-col items-center justify-center rounded-2xl px-3 py-2 text-muted-foreground transition-all duration-150 active:scale-90",
                    isActive
                      ? "bg-primary/15 text-sidebar-primary"
                      : "hover:text-foreground"
                  )}
                >
                  <Icon className="size-5" stroke={isActive ? "2.5" : "1.7"} />
                  <span className="mt-1 text-[8px] font-semibold tracking-wider uppercase">
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

export { BottomNavigation }

