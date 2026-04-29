"use client"

import * as React from "react"
import Link from "next/link"
import { IconChevronLeft } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"

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
  onBack?: () => void
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

          <Logo className="absolute right-0 scale-75 justify-end" />
        </div>
      ) : props.variant === "dashboard-back" ? (
        <div className="flex h-8 items-center gap-2">
          {props.onBack ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full px-2"
              aria-label={props.backLabel ?? "Kembali"}
              onClick={props.onBack}
            >
              <IconChevronLeft />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-2"
              asChild
            >
              <Link
                href={props.backHref ?? "/"}
                aria-label={props.backLabel ?? "Kembali"}
              >
                <IconChevronLeft />
              </Link>
            </Button>
          )}
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
