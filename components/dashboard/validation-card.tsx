import Link from "next/link"
import { IconClipboardCheck } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ValidationCardProps = {
  pendingCount: number
}

function ValidationCard({ pendingCount }: ValidationCardProps) {
  return (
    <Card className="bg-linear-to-br from-primary/16 via-background to-background">
      <CardHeader>
        <CardTitle className="text-2xl leading-tight">
          Validasi Kalkulator Konsumsi Energi Toko
        </CardTitle>
        <CardDescription>
          {pendingCount > 0
            ? "Cek alat dan jumlahnya sebelum hasil identifikasi toko dipakai."
            : "Semua kalkulasi toko sudah divalidasi."}
        </CardDescription>
        {pendingCount > 0 && (
          <CardAction>
            <Badge variant="secondary">
              {pendingCount} menunggu
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/audit/validation">
            <IconClipboardCheck data-icon="inline-start" />
            Buka Daftar Validasi
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export { ValidationCard }
