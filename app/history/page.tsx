import { BottomNavigation } from "@/components/bottom-navigation"
import { Header } from "@/components/header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function HistoryPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header variant="title-only" title="History" />

      <Card>
        <CardHeader>
          <CardTitle>History Audit</CardTitle>
          <CardDescription>
            Placeholder halaman riwayat audit. Daftar histori audit toko akan
            ditampilkan di sini.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Belum ada data yang ditampilkan.
        </CardContent>
      </Card>

      <BottomNavigation />
    </main>
  )
}
