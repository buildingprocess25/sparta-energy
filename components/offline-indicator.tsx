"use client"

import { useEffect, useState } from "react"
import { IconWifiOff } from "@tabler/icons-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine)

    updateStatus()
    window.addEventListener("online", updateStatus)
    window.addEventListener("offline", updateStatus)

    return () => {
      window.removeEventListener("online", updateStatus)
      window.removeEventListener("offline", updateStatus)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div className="sticky top-0 z-50">
      <Alert className="rounded-none border-amber-200 bg-amber-50 text-amber-950">
        <IconWifiOff className="size-4" />
        <AlertTitle>Anda sedang offline</AlertTitle>
        <AlertDescription>
          Beberapa fitur mungkin tidak tersedia.
        </AlertDescription>
      </Alert>
    </div>
  )
}
