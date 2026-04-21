import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { HeroCard } from "@/components/dashboard/hero-card"
import {
  RecentAuditSection,
  type RecentAuditItem,
} from "@/components/dashboard/recent-audit-section"
import { Header } from "@/components/header"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login")

  // Get user's store via UserStoreAccess
  const access = await prisma.userStoreAccess.findFirst({
    where: { userId: session.user.id },
    include: { store: true },
  })

  const store = access?.store

  // Fetch 5 most recent COMPLETED audits for this store
  const recentAudits = store
    ? await prisma.audit.findMany({
        where: { storeId: store.id, status: "COMPLETED" },
        orderBy: { auditDate: "desc" },
        take: 5,
        select: {
          id: true,
          auditDate: true,
          isBoros: true,
          totalEstimatedKwhPerMonth: true,
          avgActualPlnKwhPerMonth: true,
          store: { select: { salesAreaM2: true, parkingAreaM2: true, terraceAreaM2: true, warehouseAreaM2: true } },
        },
      })
    : []

  // Map to RecentAuditItem shape
  const auditItems: RecentAuditItem[] = recentAudits.map((a) => {
    const totalAreaM2 =
      Number(a.store.salesAreaM2) +
      Number(a.store.parkingAreaM2) +
      Number(a.store.terraceAreaM2) +
      Number(a.store.warehouseAreaM2) || 1

    const est = Number(a.totalEstimatedKwhPerMonth ?? 0) / totalAreaM2
    const actual = Number(a.avgActualPlnKwhPerMonth ?? 0) / totalAreaM2
    const efficiency = est > 0 ? Math.round((actual / est) * 100 * 10) / 10 : 0

    const month = new Date(a.auditDate).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    })

    return {
      id: a.id,
      period: month,
      status: a.isBoros ? "boros" : "hemat",
      standardAverage: Math.round(est * 10) / 10,
      actualAverage: Math.round(actual * 10) / 10,
      efficiency,
    }
  })

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header
        variant="dashboard"
        title={store?.name ?? "Dashboard"}
        subtitle={store?.code ?? ""}
      />

      <section className="flex flex-col gap-5">
        <HeroCard />
        <RecentAuditSection items={auditItems} />
      </section>

      <BottomNavigation />
    </main>
  )
}
