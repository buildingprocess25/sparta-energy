"use client"

import { useEffect, useState } from "react"
import { IconLoader2, IconAlertTriangle } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function DeleteUserConfirmDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    id: string
    email: string
    fullName: string | null
    auditCount: number
  }
  onSuccess?: () => void
}) {
  const [confirmEmail, setConfirmEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasAudits = user.auditCount > 0
  const isMatch = confirmEmail.trim().toLowerCase() === user.email.toLowerCase()

  // Reset confirmation input when dialog state changes
  useEffect(() => {
    if (open) {
      setConfirmEmail("")
      setIsSubmitting(false)
    }
  }, [open])

  async function handleDelete(event: React.FormEvent) {
    event.preventDefault()

    if (hasAudits) {
      toast.error("User ini tidak dapat dihapus karena memiliki riwayat audit")
      return
    }

    if (!isMatch) {
      toast.error("Konfirmasi email tidak cocok")
      return
    }

    setIsSubmitting(true)

    try {
      const { deleteUser } = await import("@/app/actions/delete-user")
      const result = await deleteUser({ userId: user.id })

      if (result.success) {
        toast.success(result.message)
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("Gagal menghapus user")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] border-rose-500/20 bg-card">
        <form onSubmit={handleDelete}>
          <DialogHeader>
            <DialogTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <IconAlertTriangle className="size-5 shrink-0 animate-pulse" />
              Hapus User Permanen
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs leading-normal">
              Tindakan ini sangat sensitif dan berisiko tinggi.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {hasAudits ? (
              /* SAFETY SHIELD: USER HAS AUDITS - DELETION STRICTLY BLOCKED */
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 space-y-2">
                <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5 leading-normal">
                  🛑 Penghapusan Diblokir Sistem
                </h4>
                <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 leading-relaxed">
                  User <b>{user.fullName || user.email}</b> memiliki <b>{user.auditCount} laporan audit aktif</b>.
                  Untuk menjaga integritas dan riwayat pelaporan cabang, database melarang keras menghapus akun ini.
                </p>
                <div className="text-[10px] text-muted-foreground leading-normal border-t border-rose-500/10 pt-2">
                  💡 <b>Solusi Alternatif:</b> Ubah email & password akun ini di menu <b>Ubah User</b> untuk mencabut hak akses tanpa merusak riwayat laporan.
                </div>
              </div>
            ) : (
              /* CLEAN DELETION PROCESS: CONFIRM BY TYPING EMAIL */
              <>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-700 dark:text-amber-400 leading-normal">
                  Mengahpus akun <b>{user.fullName || user.email}</b> akan mengakhiri semua sesi aktifnya seketika. Akun ini tidak akan bisa login lagi ke aplikasi.
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="confirm-email" className="text-xs text-foreground font-semibold leading-normal block">
                    Ketik alamat email user <b>{user.email}</b> di bawah untuk konfirmasi:
                  </Label>
                  <Input
                    id="confirm-email"
                    type="text"
                    placeholder="Ketik email konfirmasi..."
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="h-9 text-xs border-rose-500/10 focus:border-rose-500 focus:ring-rose-500"
                    required
                    autoComplete="off"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-9 text-xs"
            >
              {hasAudits ? "Tutup" : "Batal"}
            </Button>
            {!hasAudits && (
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting || !isMatch}
                className="h-9 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isSubmitting && (
                  <IconLoader2
                    aria-hidden="true"
                    className="size-4 animate-spin mr-1.5"
                  />
                )}
                Hapus Permanen
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
