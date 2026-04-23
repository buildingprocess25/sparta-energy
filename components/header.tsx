"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { IconChevronLeft, IconLogout, IconUser } from "@tabler/icons-react"
import { signOut } from "@/lib/auth-client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type DashboardLogoHeaderProps = {
  variant: "dashboard"
  title: string
  subtitle?: string
}

type DashboardBackHeaderProps = {
  variant: "dashboard-back"
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
}

type TitleOnlyHeaderProps = {
  variant: "title-only"
  title: string
  subtitle?: string
}

type DashboardHeaderProps = (
  | DashboardLogoHeaderProps
  | DashboardBackHeaderProps
  | TitleOnlyHeaderProps
) & {
  className?: string
}

function Header(props: DashboardHeaderProps) {
  const [isVisible, setIsVisible] = React.useState(true)
  const lastScrollYRef = React.useRef(0)
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === "dark"

  async function handleLogout() {
    await signOut()
    window.location.href = "/login"
  }

  const handleThemeToggle = React.useCallback(() => {
    setTheme(isDark ? "light" : "dark")
  }, [isDark, setTheme])

  React.useEffect(() => {
    lastScrollYRef.current = window.scrollY

    function controlHeader() {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      lastScrollYRef.current = currentScrollY
    }

    window.addEventListener("scroll", controlHeader, { passive: true })

    return () => {
      window.removeEventListener("scroll", controlHeader)
    }
  }, [])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-10 -mx-4 mb-5 border-b border-border/70 bg-background/95 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 backdrop-blur transition-transform duration-300 ease-out will-change-transform supports-backdrop-filter:bg-background/70 motion-reduce:transition-none",
        isVisible ? "translate-y-0" : "-translate-y-full",
        props.className
      )}
    >
      {props.variant === "dashboard" ? (
        <div className="flex min-h-8 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate text-base font-semibold text-primary">
              {props.title}
            </h1>
            {props.subtitle && (
              <p className="truncate text-xs font-medium text-muted-foreground">
                {props.subtitle}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10">
                    <IconUser className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <IconLogout className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : props.variant === "dashboard-back" ? (
        <div className="flex h-8 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-2"
            asChild
          >
            <Link href={props.backHref ?? "/"}>
              <IconChevronLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate text-base font-semibold">{props.title}</h1>
            {props.subtitle && (
              <p className="truncate text-xs font-medium text-muted-foreground">
                {props.subtitle}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-8 min-w-0 flex-col justify-center">
          <h1 className="truncate text-base font-semibold">{props.title}</h1>
          {props.subtitle && (
            <p className="truncate text-xs font-medium text-muted-foreground">
              {props.subtitle}
            </p>
          )}
        </div>
      )}
    </header>
  )
}

export { Header }
