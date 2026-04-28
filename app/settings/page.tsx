"use client"

import React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { signOut } from "@/lib/auth-client"
import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/bottom-navigation"
import {
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconInfoCircle,
  IconLogout,
  IconChevronRight,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

type Theme = "light" | "dark" | "system"

const THEMES: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: "light", label: "Terang", icon: IconSun },
  { value: "dark", label: "Gelap", icon: IconMoon },
  { value: "system", label: "Sistem", icon: IconDeviceDesktop },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 px-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
    </p>
  )
}

function MenuRow({
  icon: Icon,
  label,
  href,
  onClick,
  destructive,
  trailing,
}: {
  icon: React.ElementType
  label: string
  href?: string
  onClick?: () => void
  destructive?: boolean
  trailing?: React.ReactNode
}) {
  const className = cn(
    "flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-sm transition-colors",
    destructive
      ? "text-destructive hover:bg-destructive/5"
      : "text-foreground hover:bg-muted/60"
  )

  const inner = (
    <>
      <Icon className="size-4 shrink-0" />
      <span className="flex-1 text-left font-medium">{label}</span>
      {trailing ?? <IconChevronRight className="size-4 text-muted-foreground" />}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  )
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    await signOut()
    window.location.href = "/login"
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header variant="title-only" title="Pengaturan" />

      <div className="mt-2 flex flex-col gap-6">

        {/* ── Tema ── */}
        <section>
          <SectionLabel>Tampilan</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 text-xs font-medium transition-colors",
                  theme === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                )}
              >
                <Icon
                  className={cn(
                    "size-5",
                    theme === value ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Tentang ── */}
        <section>
          <SectionLabel>Informasi</SectionLabel>
          <MenuRow
            icon={IconInfoCircle}
            label="Tentang Aplikasi"
            href="/settings/about"
          />
        </section>

        {/* ── Akun ── */}
        <section>
          <SectionLabel>Akun</SectionLabel>
          <MenuRow
            icon={IconLogout}
            label="Keluar"
            onClick={handleLogout}
            destructive
            trailing={null}
          />
        </section>

      </div>

      <BottomNavigation />
    </main>
  )
}
