"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconDots,
  IconPencil,
  IconTrash,
  IconUserOff,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditUserDialog } from "@/components/admin/admin-user-edit-dialog"
import { DeleteUserConfirmDialog } from "@/components/admin/admin-user-delete-dialog"
import type { AdminUserRow } from "@/lib/admin-user-queries"

type AdminUserActionsProps = {
  user: AdminUserRow
  branches: string[]
  onSuccess?: () => void
}

export function AdminUserActions({
  user,
  branches,
  onSuccess,
}: AdminUserActionsProps) {
  const router = useRouter()
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [deleteUserOpen, setDeleteUserOpen] = useState(false)

  function handleSuccess() {
    router.refresh()
    onSuccess?.()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            aria-label="Aksi user"
          >
            <IconDots aria-hidden="true" className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditUserOpen(true)}>
            <IconPencil aria-hidden="true" className="mr-2 size-4" />
            Ubah User
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <IconUserOff aria-hidden="true" className="mr-2 size-4" />
            Disable User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteUserOpen(true)} variant="destructive">
            <IconTrash aria-hidden="true" className="mr-2 size-4" />
            Hapus User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserDialog
        open={editUserOpen}
        onOpenChange={setEditUserOpen}
        user={{
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          branch: user.branch,
        }}
        branches={branches}
        onSuccess={handleSuccess}
      />

      <DeleteUserConfirmDialog
        open={deleteUserOpen}
        onOpenChange={setDeleteUserOpen}
        user={{
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          auditCount: user.auditCount,
        }}
        onSuccess={handleSuccess}
      />
    </>
  )
}
