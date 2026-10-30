import { IconHistory } from "@tabler/icons-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

const timeFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
})

type DraftRestoreAlertProps = {
  savedAt: string
  onRestore: () => void
  onDiscard: () => void
}

export function DraftRestoreAlert({
  savedAt,
  onRestore,
  onDiscard,
}: DraftRestoreAlertProps) {
  return (
    <Alert>
      <IconHistory />
      <AlertTitle>Ada isian yang belum disimpan</AlertTitle>
      <AlertDescription>
        <p>
          Terakhir diubah {timeFormat.format(new Date(savedAt))} di perangkat
          ini. Pulihkan untuk melanjutkan, lalu tekan Simpan Draf.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="h-11" onClick={onRestore}>
            Pulihkan
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={onDiscard}
          >
            Buang
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
