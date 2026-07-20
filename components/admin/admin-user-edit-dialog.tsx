"use client"

import { useEffect, useState } from "react"
import {
  IconLoader2,
  IconShield,
  IconBuildingStore,
  IconUser,
} from "@tabler/icons-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { BranchCombobox } from "@/components/admin/admin-branch-combobox"

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  branches,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    id: string
    email: string
    fullName: string | null
    role: "USER" | "ADMIN"
    branch: string | null
  }
  branches: string[]
  onSuccess?: () => void
}) {
  const [email, setEmail] = useState(user.email)
  const [fullName, setFullName] = useState(user.fullName || "")
  const [role, setRole] = useState<"USER" | "ADMIN">(user.role)
  const [branch, setBranch] = useState<string>(user.branch || "none")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const normalizedBranch =
    role === "ADMIN" ? null : branch === "none" ? null : branch

  const hasChanges =
    email.trim().toLowerCase() !== user.email.toLowerCase() ||
    fullName.trim() !== (user.fullName || "") ||
    role !== user.role ||
    normalizedBranch !== user.branch

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  useEffect(() => {
    if (!open) return

    setEmail(user.email)
    setFullName(user.fullName || "")
    setRole(user.role)
    setBranch(user.branch || "none")
    setIsSubmitting(false)
  }, [open, user.branch, user.email, user.fullName, user.role])

  function handleRoleChange(value: "USER" | "ADMIN") {
    setRole(value)
    if (value === "ADMIN") setBranch("none")
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!hasChanges) {
      toast.error("Tidak ada perubahan yang dilakukan")
      return
    }

    if (!isEmailValid) {
      toast.error("Format email tidak valid")
      return
    }

    setIsSubmitting(true)

    try {
      const { updateUser } = await import("@/app/actions/update-user")

      const result = await updateUser({
        userId: user.id,
        email: email.trim().toLowerCase(),
        fullName: fullName.trim() || null,
        role,
        branch: normalizedBranch,
      })

      if (result.success) {
        toast.success(result.message)
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("Gagal mengubah data user")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ubah User</DialogTitle>
            <DialogDescription>
              Ubah data akses untuk {user.fullName || user.email}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={role}
                onValueChange={(value) =>
                  handleRoleChange(value as "USER" | "ADMIN")
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">
                    <div className="flex items-center gap-2">
                      <IconUser aria-hidden="true" className="size-4" />
                      User
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <IconShield aria-hidden="true" className="size-4" />
                      Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Cabang</Label>
              <BranchCombobox
                branches={branches}
                value={branch}
                onChange={setBranch}
                disabled={isSubmitting || role === "ADMIN"}
              />
              <p className="text-xs text-muted-foreground">
                {role === "ADMIN"
                  ? "Admin dapat mengakses dashboard admin dan audit semua cabang."
                  : "User hanya dapat mengakses cabang yang ditetapkan."}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !hasChanges || !isEmailValid}
            >
              {isSubmitting && (
                <IconLoader2
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
