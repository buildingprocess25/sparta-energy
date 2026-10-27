import Link from "next/link"
import { IconListCheck } from "@tabler/icons-react"

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

type EnergyAuditCardProps = {
  readyCount: number
}

function EnergyAuditCard({ readyCount }: EnergyAuditCardProps) {
  return (
    <Card className="bg-linear-to-br from-primary/16 via-background to-background">
      <CardHeader>
        <CardTitle className="text-2xl leading-tight">
          Pemeriksaan Energi per Kategori
        </CardTitle>
        <CardDescription>
          {readyCount > 0
            ? "Pemeriksaan langsung di toko boros yang sudah divalidasi."
            : "Belum ada toko boros tervalidasi yang menunggu pemeriksaan tata cahaya."}
        </CardDescription>
        {readyCount > 0 && (
          <CardAction>
            <Badge variant="secondary">{readyCount} toko siap diperiksa</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/audit/kategori">
            <IconListCheck data-icon="inline-start" />
            Buka Pemeriksaan Kategori
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export { EnergyAuditCard }
