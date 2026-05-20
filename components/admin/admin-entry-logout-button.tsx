"use client"

import { IconLogout } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"

export function AdminEntryLogoutButton() {
  async function handleLogout() {
    await signOut()
    window.location.href = "/login"
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="rounded-full px-2"
      onClick={handleLogout}
    >
      <IconLogout />
      Keluar
    </Button>
  )
}
