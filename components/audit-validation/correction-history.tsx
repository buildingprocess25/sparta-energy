import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type CorrectionEntry = {
  id: string
  summary: string
  createdAt: string
  validator: string | null
}

const dateTimeFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
})

export function CorrectionHistory({
  corrections,
  description = "Perubahan yang dibuat validator sebelum kalkulasi divalidasi.",
}: {
  corrections: CorrectionEntry[]
  description?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Riwayat koreksi</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Badge variant="secondary" className="tabular-nums">
            {corrections.length}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        {corrections.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada koreksi.</p>
        ) : (
          <ol className="flex flex-col divide-y text-sm">
            {corrections.map((correction) => (
              <li
                key={correction.id}
                className="flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0"
              >
                <span>{correction.summary}</span>
                <span className="text-xs text-muted-foreground">
                  {correction.validator ?? "Validator"} ·{" "}
                  {dateTimeFormat.format(new Date(correction.createdAt))}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
