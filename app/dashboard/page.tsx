import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { HeroCard } from "@/components/dashboard/hero-card"
import {
  RecentAuditSection,
  type RecentAuditItem,
} from "@/components/dashboard/recent-audit-section"
import { Header } from "@/components/header"
import { AcEstimationCard } from "@/components/dashboard/ac-estimation-card"
import { AcEstimationUnavailableNotice } from "@/components/dashboard/ac-estimation-unavailable-notice"
import { DraftListSection } from "@/components/dashboard/draft-list-section"


export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login?reason=session-expired")

  // Get all audits for stores in user's branch
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { branch: true, fullName: true, role: true },
  })

  if (!dbUser) redirect("/forbidden")
  const isAdmin = dbUser.role === "ADMIN"

  // Fetch draft audits for this user
  const draftAudits = await prisma.audit.findMany({
    where: {
      status: "DRAFT",
      auditorId: session.user.id,
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      updatedAt: true,
      store: {
        select: {
          name: true,
          code: true,
        },
      },
    },
  })

  const drafts = draftAudits.map((d) => ({
    id: d.id,
    storeName: d.store.name,
    storeCode: d.store.code,
    updatedAt: d.updatedAt,
  }))

  // Fetch 5 most recent COMPLETED audits for this user
  const branches =
    dbUser?.branch
      ?.split(",")
      .map((b) => b.trim())
      .filter(Boolean) ?? []
  const headerSubtitle = isAdmin
    ? undefined
    : branches.length > 2
      ? undefined
      : (dbUser.branch ?? "")
  const recentAudits = await prisma.audit.findMany({
    where: {
      status: "COMPLETED",
      auditorId: session.user.id,
      ...(isAdmin
        ? {}
        : {
            store: {
              branch: { in: branches },
            },
          }),
    },
    orderBy: { auditDate: "desc" },
    take: 5,
    select: {
      id: true,
      auditDate: true,
      isBoros: true,
      totalEstimatedKwhPerMonth: true,
      avgActualPlnKwhPerMonth: true,
      store: {
        select: {
          name: true,
          code: true,
          salesAreaM2: true,
          parkingAreaM2: true,
          terraceAreaM2: true,
          warehouseAreaM2: true,
        },
      },
    },
  })

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
      storeName: a.store.name,
      period: month,
      status: a.isBoros ? "boros" : "hemat",
      standardAverage: Math.round(est * 10) / 10,
      actualAverage: Math.round(actual * 10) / 10,
      efficiency,
    }
  })

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Suspense fallback={null}>
        <AcEstimationUnavailableNotice />
      </Suspense>
      <Header
        variant="dashboard"
        title={dbUser?.fullName ?? "Dashboard"}
        subtitle={headerSubtitle}
      />

      <section className="mt-2 flex flex-col gap-4">
        <HeroCard />
        <AcEstimationCard />
      </section>

      <section className="mt-5 flex flex-col gap-5">
        <DraftListSection drafts={drafts} />
        <RecentAuditSection items={auditItems} />
      </section>

      <BottomNavigation />
    </main>
  )
}
