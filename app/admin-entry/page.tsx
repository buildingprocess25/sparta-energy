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
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-8">
      <header className="flex items-center justify-between pt-[max(1rem,env(safe-area-inset-top))] pb-5">
        <Logo className="scale-90" />
        <AdminEntryLogoutButton />
      </header>

      <section className="flex flex-1 flex-col justify-center gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">
            Halo, {user.fullName ?? "Admin"}
          </p>

          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            Pilih peran untuk melanjutkan.
          </p>
        </div>

        <div className="grid gap-3">
          <Link
            href="/dashboard"
            className="group flex items-center gap-4 rounded-2xl border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-muted/50"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <IconClipboardCheck className="size-6" />
            </span>
            <span className="min-w-0 flex-1 space-y-0.5">
              <span className="block text-base font-semibold leading-tight">Mode Auditor</span>
              <span className="block text-sm leading-tight text-muted-foreground">
                Audit energi toko
              </span>
              <span className="block text-xs leading-tight text-muted-foreground/80">
                (Disarankan Mobile)
              </span>
            </span>
          </Link>

          <Link
            href="/admin/dashboard"
            className="group flex items-center gap-4 rounded-2xl border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-muted/50"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <IconLayoutDashboard className="size-6" />
            </span>
            <span className="min-w-0 flex-1 space-y-0.5">
              <span className="block text-base font-semibold leading-tight">
                Dashboard Admin
              </span>
              <span className="block text-sm leading-tight text-muted-foreground">
                Monitoring & analitik cabang
              </span>
              <span className="block text-xs leading-tight text-muted-foreground/80">
                (Disarankan Desktop)
              </span>
            </span>
          </Link>
        </div>
      </section>
    </main>
  )
}
