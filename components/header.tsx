"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { IconChevronLeft, IconMoon, IconSun, IconBuildingStore } from "@tabler/icons-react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <IconBuildingStore className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="truncate text-base font-semibold">{props.title}</h1>
              {props.subtitle && (
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {props.subtitle}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-2"
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
            disabled={!mounted}
          >
            {mounted && isDark ? (
              <IconSun className="size-4" />
            ) : (
              <IconMoon className="size-4" />
            )}
          </Button>
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
          <div className="flex flex-col min-w-0">
            <h1 className="truncate text-base font-semibold">{props.title}</h1>
            {props.subtitle && (
              <p className="truncate text-xs font-medium text-muted-foreground">
                {props.subtitle}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-8 flex-col justify-center min-w-0">
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
