"use client"

import { useEffect, useState } from "react"
import {
  IconLoader2,
  IconShield,
  IconBuildingStore,
  IconUser,
  IconKey,
  IconEye,
  IconEyeOff,
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

export function CreateUserDialog({
  open,
  onOpenChange,
  branches,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  branches: string[]
  onSuccess?: () => void
}) {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"USER" | "ADMIN">("USER")
  const [branch, setBranch] = useState<string>("none")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const normalizedBranch =
    role === "ADMIN" ? null : branch === "none" ? null : branch

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  // Reset form states when opened
  useEffect(() => {
    if (open) {
      setEmail("")
      setFullName("")
      setRole("USER")
      setBranch("none")
      setIsSubmitting(false)
    }
  }, [open])

  function handleRoleChange(value: "USER" | "ADMIN") {
    setRole(value)
    if (value === "ADMIN") setBranch("none")
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!email.trim()) {
      toast.error("Email wajib diisi")
      return
    }

    if (!isEmailValid) {
      toast.error("Format email tidak valid")
      return
    }

    setIsSubmitting(true)

    try {
      const { createUser } = await import("@/app/actions/create-user")

      const result = await createUser({
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
      toast.error("Gagal menambahkan user baru")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} autoComplete="off">
          <DialogHeader>
            <DialogTitle>Tambah User Baru</DialogTitle>
            <DialogDescription>
              Buat akun pengguna baru dan atur hak aksesnya.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoComplete="new-email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-fullName">Nama Lengkap</Label>
              <Input
                id="create-fullName"
                type="text"
                placeholder="Nama lengkap user"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>



            <div className="space-y-2">
              <Label htmlFor="create-role">Role *</Label>
              <Select
                value={role}
                onValueChange={(value) =>
                  handleRoleChange(value as "USER" | "ADMIN")
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="create-role">
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
              <Label htmlFor="create-branch">Cabang</Label>
              <BranchCombobox
                branches={branches}
                value={branch}
                onChange={setBranch}
                disabled={isSubmitting || role === "ADMIN"}
              />
              <p className="text-[11px] text-muted-foreground leading-normal">
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
              disabled={isSubmitting || !email.trim() || !isEmailValid}
            >
              {isSubmitting && (
                <IconLoader2
                  aria-hidden="true"
                  className="size-4 animate-spin mr-1.5"
                />
              )}
              Tambah User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

