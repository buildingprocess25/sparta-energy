import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { IconClipboardCheck, IconLayoutDashboard } from "@tabler/icons-react"

import { AdminEntryLogoutButton } from "@/components/admin/admin-entry-logout-button"
import { Logo } from "@/components/logo"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function AdminEntryPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login?reason=session-expired")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { fullName: true, role: true },
  })

  if (!user) redirect("/forbidden")
  if (user.role !== "ADMIN") redirect("/dashboard")

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background px-4 py-8 md:p-8">
      {/* Background Ambient Glows & Grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] dark:opacity-25"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 z-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-1/4 z-0 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-[100px]"
        aria-hidden="true"
      />

      {/* Main Container: Mobile fullscreen, Desktop elevated glassmorphic panel */}
      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-col justify-between rounded-3xl border-0 bg-transparent p-2 md:max-w-2xl md:border md:border-border/60 md:bg-card/85 md:p-8 md:shadow-2xl md:backdrop-blur-xl lg:p-10">
        <header className="flex items-center justify-between pb-6">
          <Logo className="scale-90 md:scale-95" />
          <AdminEntryLogoutButton />
        </header>

        <section className="flex flex-1 flex-col justify-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-sm font-medium text-primary">
              Halo, {user.fullName ?? "Admin"}
            </p>
            <p className="text-sm text-muted-foreground">
              Pilih peran untuk melanjutkan.
            </p>
          </div>

          <div className="grid gap-3.5 md:grid-cols-2 md:gap-4">
            <Link
              href="/dashboard"
              className="group flex flex-row items-center gap-4 rounded-2xl border border-border/70 bg-card p-4.5 text-card-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-muted/40 hover:shadow-md md:flex-col md:items-start md:p-5"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <IconClipboardCheck className="size-6" />
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="block text-base font-semibold leading-tight text-foreground group-hover:text-primary">
                    Mode Auditor
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Mobile
                  </span>
                </div>
                <span className="block text-xs leading-tight text-muted-foreground">
                  Audit energi &amp; checklist peralatan toko aktif.
                </span>
              </div>
            </Link>

            <Link
              href="/admin/dashboard"
              className="group flex flex-row items-center gap-4 rounded-2xl border border-border/70 bg-card p-4.5 text-card-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary-foreground/30 hover:bg-muted/40 hover:shadow-md md:flex-col md:items-start md:p-5"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground shadow-md">
                <IconLayoutDashboard className="size-6" />
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="block text-base font-semibold leading-tight text-foreground group-hover:text-primary">
                    Dashboard Admin
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    Desktop
                  </span>
                </div>
                <span className="block text-xs leading-tight text-muted-foreground">
                  Monitoring cabang, tren PLN, &amp; prioritas audit.
                </span>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
