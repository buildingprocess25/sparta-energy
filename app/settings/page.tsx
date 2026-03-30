import { BottomNavigation } from "@/components/bottom-navigation"
import { Header } from "@/components/header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-32">
      <Header variant="title-only" title="Settings" />

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan</CardTitle>
          <CardDescription>
            Placeholder halaman pengaturan aplikasi. Konfigurasi akun dan
            preferensi audit akan ditampilkan di sini.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Fitur settings belum tersedia.
        </CardContent>
      </Card>

      <BottomNavigation />
    </main>
  )
}
