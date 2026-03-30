import { BottomNavigation } from "@/components/bottom-navigation"
import { Header } from "@/components/header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ReportsPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header variant="title-only" title="Reports" />

      <Card>
        <CardHeader>
          <CardTitle>Reports Energi</CardTitle>
          <CardDescription>
            Placeholder halaman laporan. Grafik performa dan export laporan
            audit akan ditampilkan di sini.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Modul reporting sedang disiapkan.
        </CardContent>
      </Card>

      <BottomNavigation />
    </main>
  )
}
