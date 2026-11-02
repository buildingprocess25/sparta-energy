"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

export type DraftBackup<T> = { savedAt: string; data: T }

// Storage can be blocked (private mode, full quota); the form then works without a backup.
function readBackup<T>(key: string, serverUpdatedAt: string | null) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DraftBackup<T>
    // A backup older than the saved draft has already reached the server.
    if (serverUpdatedAt && parsed.savedAt <= serverUpdatedAt) {
      window.localStorage.removeItem(key)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

// Keeps unsaved input in this browser, so a reload or a closed tab loses nothing.
export function useDraftBackup<T>(
  key: string,
  data: T,
  isDirty: boolean,
  serverUpdatedAt: string | null
) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  // Read once on open: the backup from the last visit, not the one this visit keeps writing.
  const [stored] = useState(() =>
    typeof window === "undefined" ? null : readBackup<T>(key, serverUpdatedAt)
  )
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!isDirty) return
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          key,
          JSON.stringify({ savedAt: new Date().toISOString(), data })
        )
      } catch {
        // Backup is best effort.
      }
    }, 500)
    return () => window.clearTimeout(timer)
  }, [key, data, isDirty])

  function clearBackup() {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Nothing stored or storage blocked.
    }
    setDismissed(true)
  }

  return {
    backup: mounted && !dismissed ? stored : null,
    clearBackup,
    dismissBackup: () => setDismissed(true),
  }
}
