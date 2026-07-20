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
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [role, setRole] = useState<"USER" | "ADMIN">("USER")
  const [branch, setBranch] = useState<string>("none")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const normalizedBranch =
    role === "ADMIN" ? null : branch === "none" ? null : branch

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const isPasswordValid = password.length >= 6 && password === confirmPassword

  // Reset form states when opened
  useEffect(() => {
    if (open) {
      setEmail("")
      setFullName("")
      setPassword("")
      setConfirmPassword("")
      setShowPassword(false)
      setShowConfirmPassword(false)
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

    if (!email.trim() || !password || !confirmPassword) {
      toast.error("Email, password, dan konfirmasi password wajib diisi")
      return
    }

    if (!isEmailValid) {
      toast.error("Format email tidak valid")
      return
    }



    if (password !== confirmPassword) {
      toast.error("Password dan Konfirmasi Password tidak cocok")
      return
    }

    setIsSubmitting(true)

    try {
      const { createUser } = await import("@/app/actions/create-user")

      const result = await createUser({
        email: email.trim().toLowerCase(),
        fullName: fullName.trim() || null,
        password,
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
        <form onSubmit={handleSubmit}>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-password">Password *</Label>
              <div className="relative">
                <Input
                  id="create-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  tabIndex={-1}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <IconEyeOff className="size-4" />
                  ) : (
                    <IconEye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-confirm-password">Konfirmasi Password *</Label>
              <div className="relative">
                <Input
                  id="create-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ketik ulang password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  tabIndex={-1}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <IconEyeOff className="size-4" />
                  ) : (
                    <IconEye className="size-4" />
                  )}
                </button>
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">Password tidak cocok</p>
              )}
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
              <Select
                value={branch}
                onValueChange={setBranch}
                disabled={isSubmitting || role === "ADMIN"}
              >
                <SelectTrigger id="create-branch">
                  <SelectValue placeholder="Pilih cabang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <IconBuildingStore
                        aria-hidden="true"
                        className="size-4"
                      />
                      (Tidak ada cabang)
                    </div>
                  </SelectItem>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <IconBuildingStore
                        aria-hidden="true"
                        className="size-4"
                      />
                      Semua Cabang (Super Auditor)
                    </div>
                  </SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b} value={b}>
                      <div className="flex items-center gap-2">
                        <IconBuildingStore
                          aria-hidden="true"
                          className="size-4"
                        />
                        {b}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              disabled={isSubmitting || !email.trim() || !password || !confirmPassword || !isEmailValid || !isPasswordValid}
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

