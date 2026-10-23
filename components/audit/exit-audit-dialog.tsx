"use client"

import * as React from "react"
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export type ExitAuditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeName: string
  storeCode?: string
  isSaving?: boolean
  onSaveAndExit: () => void | Promise<void>
  onExitWithoutSave: () => void
  onCancel: () => void
}

export function ExitAuditDialog({
  open,
  onOpenChange,
  storeName,
  storeCode,
  isSaving = false,
  onSaveAndExit,
  onExitWithoutSave,
  onCancel,
}: ExitAuditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[360px] rounded-2xl" showCloseButton={!isSaving}>
        <DialogHeader>
          <div className="flex justify-center pb-2">
            <div className="flex size-11 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <IconAlertTriangle className="size-6" />
            </div>
          </div>
          <DialogTitle className="text-center text-base font-bold text-foreground">
            Simpan Progres Kalkulasi?
          </DialogTitle>
          <DialogDescription className="text-center text-xs leading-relaxed text-muted-foreground">
            Anda memiliki progres kalkulasi untuk toko{" "}
            <strong className="text-foreground">
              {storeName}
              {storeCode ? ` (${storeCode})` : ""}
            </strong>{" "}
            yang belum tersimpan. Ingin menyimpannya ke draf sebelum keluar?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <div className="flex w-full flex-col gap-2 pt-2">
            <Button
              type="button"
              variant="default"
              className="h-10 w-full rounded-xl text-xs font-semibold"
              onClick={onSaveAndExit}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  <span>Menyimpan ke Draf...</span>
                </>
              ) : (
                "Simpan ke Draf"
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-10 w-full rounded-xl text-xs border border-destructive/20"
              onClick={onExitWithoutSave}
              disabled={isSaving}
            >
              Keluar Tanpa Menyimpan
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full rounded-xl text-xs"
              onClick={onCancel}
              disabled={isSaving}
            >
              Batal
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
