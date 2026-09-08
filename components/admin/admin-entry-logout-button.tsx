"use client"

import { IconLogout } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"

export function AdminEntryLogoutButton() {
  async function handleLogout() {
    await signOut()
    window.location.href = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:5173/"
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
