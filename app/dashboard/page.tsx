import {
  AuditListSection,
  type AuditItem,
} from "@/components/dashboard/audit-list-section"
import { BottomNavigation } from "@/components/bottom-navigation"
import { HeroCard } from "@/components/dashboard/hero-card"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { Header } from "@/components/header"

const auditItems: AuditItem[] = [
  {
    id: "A-0123",
    site: "Toko Sudirman City",
    location: "Sudirman Central",
    intensity: "12.4",
    unit: "kWh/m²/bln",
    relativeTime: "3 hari lalu",
    status: "hemat",
  },
  {
    id: "A-0124",
    site: "Toko Menteng Raya",
    location: "Menteng Office",
    intensity: "10.8",
    unit: "kWh/m²/bln",
    relativeTime: "5 hari lalu",
    status: "hemat",
  },
  {
    id: "A-0125",
    site: "Toko Kemang Walk",
    location: "Kemang Hub",
    intensity: "14.1",
    unit: "kWh/m²/bln",
    relativeTime: "1 minggu lalu",
    status: "boros",
  },
]

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header variant="dashboard" logoHref="/dashboard" />

      <section className="flex flex-col gap-5">
        <HeroCard />
        <SummaryCards />
        <AuditListSection items={auditItems} />
      </section>

      <BottomNavigation />
    </main>
  )
}
