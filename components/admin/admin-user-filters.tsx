"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  IconBuildingStore,
  IconCheck,
  IconFileSpreadsheet,
  IconFilterOff,
  IconSearch,
  IconShield,
  IconShieldCheck,
  IconUser,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateUserDialog } from "@/components/admin/admin-user-create-dialog"
import { ImportUserCsvDialog } from "@/components/admin/admin-user-import-dialog"

type AdminUserFiltersProps = {
  branches: string[]
  roles: string[]
}

export function AdminUserFilters({ branches, roles }: AdminUserFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentQ = searchParams.get("q") ?? ""
  const currentRole = (searchParams.get("role") ?? "all").toLowerCase()
  const currentBranchParam = searchParams.get("branch") ?? ""

  const [searchQuery, setSearchQuery] = useState(currentQ)
  const [branchSearch, setBranchSearch] = useState("")
  const [branchPopoverOpen, setBranchPopoverOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  useEffect(() => {
    setSearchQuery(currentQ)
  }, [currentQ])

  const selectedBranches = useMemo(() => {
    if (!currentBranchParam || currentBranchParam === "all") return []
    return currentBranchParam
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean)
  }, [currentBranchParam])

  const filteredBranchList = useMemo(() => {
    const q = branchSearch.toLowerCase().trim()
    if (!q) return branches
    return branches.filter((b) => b.toLowerCase().includes(q))
  }, [branches, branchSearch])

  function updateParams(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(newParams)) {
      if (!value || value === "all") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }

    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function handleSearchSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    updateParams({ q: searchQuery.trim() })
  }

  function handleRoleChange(value: string) {
    updateParams({ role: value })
  }

  function handleBranchToggle(branchName: string) {
    let nextBranches: string[]
    if (selectedBranches.includes(branchName)) {
      nextBranches = selectedBranches.filter((b) => b !== branchName)
    } else {
      nextBranches = [...selectedBranches, branchName]
    }

    updateParams({
      branch: nextBranches.length ? nextBranches.join(",") : null,
    })
  }

  function handleSelectAllBranches() {
    const combined = Array.from(
      new Set([...selectedBranches, ...filteredBranchList])
    )
    updateParams({
      branch: combined.length ? combined.join(",") : null,
    })
  }

  function handleClearAllBranches() {
    updateParams({ branch: null })
  }

  function handleResetAll() {
    setSearchQuery("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    params.delete("role")
    params.delete("branch")
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const hasActiveFilters = Boolean(
    currentQ ||
      (currentRole && currentRole !== "all") ||
      selectedBranches.length > 0
  )

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Search Input */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex w-full items-center sm:w-72"
        >
          <IconSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau email..."
            className="h-9 pr-14 pl-9 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                updateParams({ q: null })
              }}
              className="absolute right-9 p-1 text-muted-foreground hover:text-foreground"
            >
              <IconX className="size-3.5" />
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="absolute right-1 h-7 px-2 text-xs font-medium"
          >
            Cari
          </Button>
        </form>

        {/* Role Selector */}
        <div className="w-40">
          <Select value={currentRole} onValueChange={handleRoleChange}>
            <SelectTrigger size="sm" className="h-9 w-full text-xs">
              <SelectValue placeholder="Semua Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-1.5">
                  <IconShield className="size-3.5 text-muted-foreground" />
                  <span>Semua Role</span>
                </div>
              </SelectItem>
              <SelectItem value="user">
                <div className="flex items-center gap-1.5">
                  <IconUser className="size-3.5 text-muted-foreground" />
                  <span>User / Auditor</span>
                </div>
              </SelectItem>
              <SelectItem value="admin">
                <div className="flex items-center gap-1.5">
                  <IconShieldCheck className="size-3.5 text-primary" />
                  <span>Admin</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Multi-select Branch Popover with Checkboxes */}
        <Popover
          open={branchPopoverOpen}
          onOpenChange={setBranchPopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 px-3 text-xs font-normal"
            >
              <IconBuildingStore className="size-3.5 text-muted-foreground" />
              <span>Cabang</span>
              {selectedBranches.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 px-1.5 py-0 text-[10px] font-semibold"
                >
                  {selectedBranches.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-72 p-0 shadow-lg"
          >
            <div className="border-b p-2.5">
              <div className="relative">
                <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={branchSearch}
                  onChange={(e) => setBranchSearch(e.target.value)}
                  placeholder="Cari nama cabang..."
                  className="h-8 pr-7 pl-8 text-xs"
                />
                {branchSearch && (
                  <button
                    type="button"
                    onClick={() => setBranchSearch("")}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <IconX className="size-3" />
                  </button>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAllBranches}
                  className="font-medium text-primary hover:underline"
                >
                  Pilih Semua ({filteredBranchList.length})
                </button>
                {selectedBranches.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllBranches}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Hapus Pilihan
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto p-1.5">
              {filteredBranchList.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  Tidak ada cabang ditemukan.
                </div>
              ) : (
                filteredBranchList.map((branch) => {
                  const isChecked = selectedBranches.includes(branch)
                  return (
                    <label
                      key={branch}
                      className="flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs hover:bg-muted"
                    >
                      <span className="truncate pr-2 font-normal">
                        {branch}
                      </span>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleBranchToggle(branch)}
                      />
                    </label>
                  )
                })
              )}
            </div>

            {selectedBranches.length > 0 && (
              <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-2 text-xs">
                <span className="text-muted-foreground">
                  {selectedBranches.length} cabang terpilih
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-[11px]"
                  onClick={() => setBranchPopoverOpen(false)}
                >
                  Tutup
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleResetAll}
          >
            <IconFilterOff className="size-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-xs"
          onClick={() => setImportOpen(true)}
        >
          <IconFileSpreadsheet className="size-3.5" />
          Import CSV
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-9 gap-1.5 text-xs"
          onClick={() => setCreateOpen(true)}
        >
          <IconUserPlus className="size-3.5" />
          Tambah User
        </Button>
      </div>

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        branches={branches}
        onSuccess={() => router.refresh()}
      />

      <ImportUserCsvDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
