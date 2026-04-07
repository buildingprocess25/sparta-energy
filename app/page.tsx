import Link from "next/link"
import { IconArrowRight } from "@tabler/icons-react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center bg-background px-4 py-8">
      <Card className="bg-linear-to-br from-primary/16 via-background to-background">
        <CardHeader className="flex flex-col items-center text-center">
          <Logo className="scale-95" />
          <CardTitle className="text-2xl">SPARTA Energy</CardTitle>
          <CardDescription>
            Sistem audit energi untuk memantau efisiensi toko, menemukan sumber
            pemborosan, dan menghasilkan insight tindakan.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              Masuk Dashboard
              <IconArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Ke Halaman Login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
