"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { IconLoader2, IconSearch } from "@tabler/icons-react"
import { toast } from "sonner"

import {
  getUserDeviceAccess,
  saveUserDeviceAccess,
} from "@/app/actions/device-access"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { MonitoringDevice } from "@/lib/monitoring-devices"

type DeviceGroup = {
  key: string
  title: string
  subtitle: string | null
  devices: MonitoringDevice[]
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready"
      devices: MonitoringDevice[]
      devicesMessage: string | null
      savedIds: string[]
    }

const NO_STORE = "__tanpa-toko__"
const MISSING = "__tidak-di-portal__"

// Devices grouped per store; saved IDs the portal no longer lists get their own group
// so they can still be removed.
function groupDevices(devices: MonitoringDevice[], savedIds: string[]) {
  const groups = new Map<string, DeviceGroup>()
  for (const device of devices) {
    const key = device.storeCode ?? NO_STORE
    const group = groups.get(key) ?? {
      key,
      title: device.storeCode ?? "Tanpa kode toko",
      subtitle: device.storeName,
      devices: [],
    }
    group.devices.push(device)
    groups.set(key, group)
  }

  const known = new Set(devices.map((device) => device.id))
  const missing = savedIds.filter((id) => !known.has(id))
  const sorted = Array.from(groups.values()).sort((a, b) =>
    a.key === NO_STORE
      ? 1
      : b.key === NO_STORE
        ? -1
        : a.title.localeCompare(b.title)
  )
  if (missing.length > 0) {
    sorted.push({
      key: MISSING,
      title: "Tidak ada di portal",
      subtitle: "Masih tersimpan, tetapi alatnya tidak ditemukan lagi.",
      devices: missing.map((id) => ({
        id,
        name: id,
        storeCode: null,
        storeName: null,
        online: false,
      })),
    })
  }
  return sorted
}

function matches(group: DeviceGroup, device: MonitoringDevice, query: string) {
  if (!query) return true
  return [group.title, group.subtitle, device.id, device.name]
    .filter(Boolean)
    .some((text) => text!.toLowerCase().includes(query))
}

export function UserDeviceDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { id: string; email: string; fullName: string | null }
  onSuccess?: () => void
}) {
  const [state, setState] = useState<LoadState>({ status: "loading" })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const name = user.fullName || user.email

  const load = useCallback(async () => {
    setState({ status: "loading" })
    const result = await getUserDeviceAccess(user.id)
    if (!result.success) {
      setState({ status: "error", message: result.message })
      return
    }
    setSelected(new Set(result.assignedIds))
    setState({
      status: "ready",
      devices: result.devices ?? [],
      devicesMessage: result.devicesMessage,
      savedIds: result.assignedIds,
    })
  }, [user.id])

  useEffect(() => {
    if (!open) return
    setSearch("")
    void load()
  }, [open, load])

  const groups = useMemo(
    () =>
      state.status === "ready"
        ? groupDevices(state.devices, state.savedIds)
        : [],
    [state]
  )
  const query = search.trim().toLowerCase()
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      devices: group.devices.filter((device) => matches(group, device, query)),
    }))
    .filter((group) => group.devices.length > 0)

  const hasChanges =
    state.status === "ready" &&
    (selected.size !== state.savedIds.length ||
      state.savedIds.some((id) => !selected.has(id)))

  function setDevices(ids: string[], checked: boolean) {
    setSelected((current) => {
      const next = new Set(current)
      for (const id of ids) {
        if (checked) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      const result = await saveUserDeviceAccess(user.id, Array.from(selected))
      if (result.success) {
        toast.success(result.message)
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("Akses alat gagal disimpan. Coba lagi.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Atur alat untuk {name}</DialogTitle>
          <DialogDescription>
            User GS hanya melihat alat yang dicentang di portal monitoring.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[calc(90svh-11rem)] flex-col gap-4 overflow-y-auto px-6 py-5">
          {state.status === "loading" && (
            <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <IconLoader2 aria-hidden="true" className="size-4 animate-spin" />
              Memuat daftar alat…
            </p>
          )}

          {state.status === "error" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p role="alert" className="text-sm text-muted-foreground">
                {state.message}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void load()}
              >
                Coba lagi
              </Button>
            </div>
          )}

          {state.status === "ready" && (
            <>
              {state.devicesMessage && (
                <Alert>
                  <AlertDescription>
                    {state.devicesMessage} Alat yang sudah tersimpan tetap
                    berlaku.
                  </AlertDescription>
                </Alert>
              )}

              <div className="relative">
                <IconSearch
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari kode toko, nama toko, atau ID alat"
                  aria-label="Cari alat"
                  className="h-11 pl-9"
                />
              </div>

              {groups.length === 0 ? (
                <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  Portal monitoring belum punya alat.
                </p>
              ) : visibleGroups.length === 0 ? (
                <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  Tidak ada alat yang cocok dengan &ldquo;{search.trim()}
                  &rdquo;.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {visibleGroups.map((group) => {
                    const ids = group.devices.map((device) => device.id)
                    const checkedCount = ids.filter((id) =>
                      selected.has(id)
                    ).length
                    const groupId = `device-group-${group.key}`
                    return (
                      <li
                        key={group.key}
                        className="overflow-hidden rounded-xl border"
                      >
                        <label
                          htmlFor={groupId}
                          className="flex min-h-11 cursor-pointer items-center gap-3 bg-muted/40 px-3 py-2"
                        >
                          <Checkbox
                            id={groupId}
                            checked={
                              checkedCount === 0
                                ? false
                                : checkedCount === ids.length
                                  ? true
                                  : "indeterminate"
                            }
                            onCheckedChange={(checked) =>
                              setDevices(ids, checked === true)
                            }
                            aria-label={`Pilih semua alat ${group.title}`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium">
                              {group.title}
                            </span>
                            {group.subtitle && (
                              <span className="block truncate text-xs text-muted-foreground">
                                {group.subtitle}
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {checkedCount}/{ids.length} alat
                          </span>
                        </label>
                        <ul>
                          {group.devices.map((device) => {
                            const id = `device-${device.id}`
                            return (
                              <li key={device.id} className="border-t">
                                <label
                                  htmlFor={id}
                                  className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 pl-9 hover:bg-muted/30"
                                >
                                  <Checkbox
                                    id={id}
                                    checked={selected.has(device.id)}
                                    onCheckedChange={(checked) =>
                                      setDevices([device.id], checked === true)
                                    }
                                  />
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm">
                                      {device.name}
                                    </span>
                                    {device.name !== device.id && (
                                      <span className="block text-xs text-muted-foreground">
                                        {device.id}
                                      </span>
                                    )}
                                  </span>
                                  {group.key !== MISSING && (
                                    <span className="text-xs text-muted-foreground">
                                      {device.online ? "Online" : "Offline"}
                                    </span>
                                  )}
                                </label>
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {state.status === "ready" ? `${selected.size} alat dipilih` : null}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={state.status !== "ready" || !hasChanges || isSaving}
            >
              {isSaving && (
                <IconLoader2
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              )}
              Simpan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
