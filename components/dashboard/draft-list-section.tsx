"use client"

import * as React from "react"
import { IconTrash, IconPlayerPlay, IconLoader2, IconAlertCircle } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuditStore } from "@/store/use-audit-store"
import { getAuditDraft, deleteAuditDraft } from "@/app/actions/save-draft"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type DraftItem = {
  id: string
  storeName: string
  storeCode: string
  updatedAt: string | Date
}

type DraftListSectionProps = {
  drafts: DraftItem[]
}

export function DraftListSection({ drafts }: DraftListSectionProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  if (drafts.length === 0) return null

  async function handleResume(id: string) {
    setLoadingId(id)
    try {
      const result = await getAuditDraft(id)
      if ("error" in result && result.error) {
        toast.error(result.error.message)
        setLoadingId(null)
        return
      }

      if ("draftData" in result && result.draftData) {
        // Set state in Zustand store
        useAuditStore.setState(result.draftData)
        toast.success(`Melanjutkan draf untuk toko ${result.draftData.storeName}`)
        router.push("/audit/start?step=1")
      }
    } catch (error) {
      toast.error("Gagal memuat draf audit.")
      setLoadingId(null)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const result = await deleteAuditDraft(id)
      if ("error" in result && result.error) {
        toast.error(result.error.message)
        setDeletingId(null)
        return
      }

      toast.success("Draf berhasil dihapus")
      router.refresh()
    } catch (error) {
      toast.error("Gagal menghapus draf.")
      setDeletingId(null)
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold">Draf Audit Aktif</h2>
        <p className="text-[11px] text-muted-foreground">
          Lanjutkan pengisian audit Anda yang belum selesai
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {drafts.map((draft) => {
          const dateStr = new Date(draft.updatedAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })

          const isLoading = loadingId === draft.id
          const isDeleting = deletingId === draft.id

          return (
            <Card
              key={draft.id}
              className="overflow-hidden border border-border/80 bg-card/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase">
                      Draft
                    </span>
                    <h3 className="truncate text-sm font-bold text-foreground">
                      {draft.storeName}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Kode: {draft.storeCode}
                  </p>
                  <p className="mt-2 text-[10px] font-medium text-muted-foreground/85">
                    Terakhir diubah: {dateStr}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Delete Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 rounded-xl text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive"
                        disabled={isLoading || isDeleting}
                      >
                        {isDeleting ? (
                          <IconLoader2 className="size-4 animate-spin text-destructive" />
                        ) : (
                          <IconTrash className="size-4" />
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[320px] rounded-2xl" showCloseButton={false}>
                      <DialogHeader>
                        <div className="flex justify-center pb-2">
                          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <IconAlertCircle className="size-5" />
                          </div>
                        </div>
                        <DialogTitle className="text-center text-sm font-bold">
                          Hapus Draf?
                        </DialogTitle>
                        <DialogDescription className="text-center text-xs">
                          Draf audit toko <strong>{draft.storeName}</strong> akan dihapus permanen.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="mt-4 flex flex-row gap-2 sm:justify-center">
                        <DialogClose asChild>
                          <Button variant="outline" className="mt-0 flex-1 rounded-xl text-xs h-9">
                            Batal
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            onClick={() => handleDelete(draft.id)}
                            className="flex-1 rounded-xl bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90 h-9"
                          >
                            Hapus
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={() => handleResume(draft.id)}
                    disabled={isLoading || isDeleting}
                    size="sm"
                    className="h-9 gap-1 rounded-xl px-3 text-xs"
                  >
                    {isLoading ? (
                      <IconLoader2 className="size-3.5 animate-spin" />
                    ) : (
                      <IconPlayerPlay className="size-3.5 fill-current" />
                    )}
                    Lanjutkan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
