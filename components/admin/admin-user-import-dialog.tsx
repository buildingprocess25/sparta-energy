"use client"

import React, { useState, useRef } from "react"
import {
  IconUpload,
  IconLoader2,
  IconCheck,
  IconAlertCircle,
  IconX,
  IconSearch,
  IconFileSpreadsheet,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { checkExistingEmails, importUsersBulk } from "@/app/actions/import-users"

type CsvUserRow = {
  email: string
  fullName: string
  branch: string | null
  passwordDefault: string
  status: "new" | "duplicate" | "invalid"
  message?: string
}

export function ImportUserCsvDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<CsvUserRow[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "duplicate">("all")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CSV Parser respecting quotes
  function parseCsvLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast.error("Format file harus berupa CSV (.csv)")
        return
      }
      setFile(selectedFile)
      parseCsv(selectedFile)
    }
  }

  async function parseCsv(csvFile: File) {
    setIsParsing(true)
    setParsedRows([])
    try {
      const text = await csvFile.text()
      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)

      if (lines.length < 2) {
        toast.error("File CSV kosong atau tidak memiliki data baris.")
        setIsParsing(false)
        return
      }

      // Parse headers
      const headers = parseCsvLine(lines[0].toLowerCase())
      const emailIdx = headers.indexOf("email")
      const nameIdx = headers.indexOf("nama_lengkap")
      const asalIdx = headers.indexOf("asal_cabang")
      const coverageIdx = headers.indexOf("coverage_cabang")

      if (emailIdx === -1 || nameIdx === -1) {
        toast.error("Kolom 'email' dan 'nama_lengkap' wajib ada di baris pertama CSV.")
        setIsParsing(false)
        return
      }

      const rows: Omit<CsvUserRow, "status">[] = []
      const emailList: string[] = []

      for (let i = 1; i < lines.length; i++) {
        const columns = parseCsvLine(lines[i])
        if (columns.length < 2) continue

        const rawEmail = columns[emailIdx]?.trim() || ""
        const rawName = columns[nameIdx]?.trim() || ""
        const rawAsal = asalIdx !== -1 ? columns[asalIdx]?.trim() || "" : ""
        const rawCoverage = coverageIdx !== -1 ? columns[coverageIdx]?.trim() || "" : ""

        if (!rawEmail) continue

        // Validation & normalization
        const email = rawEmail.toLowerCase()
        const fullName = rawName.toUpperCase()

        // Combine branch (asal_cabang + coverage_cabang), replace ; with ,
        const asalBranches = rawAsal
          .split(";")
          .map((b) => b.trim())
          .filter(Boolean)
        const coverageBranches = rawCoverage
          .split(";")
          .map((b) => b.trim())
          .filter(Boolean)

        // Find unique combined branches
        const uniqueBranches = Array.from(new Set([...asalBranches, ...coverageBranches]))
        const branchString = uniqueBranches.length > 0 ? uniqueBranches.join(", ") : null

        // Default password = first branch of asal_cabang in UPPERCASE, or first coverage, or fallback
        const baseBranch = asalBranches[0] || coverageBranches[0] || "SPARTA"
        const passwordDefault = baseBranch.toUpperCase().trim()

        rows.push({
          email,
          fullName,
          branch: branchString,
          passwordDefault,
        })
        emailList.push(email)
      }

      if (rows.length === 0) {
        toast.error("Tidak ada baris data valid untuk di-import.")
        setIsParsing(false)
        return
      }

      // Check duplicates against DB
      const existingEmails = await checkExistingEmails(emailList)
      const existingEmailsSet = new Set(existingEmails.map((e) => e.toLowerCase()))

      const validatedRows: CsvUserRow[] = rows.map((r) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(r.email)) {
          return {
            ...r,
            status: "invalid",
            message: "Format email tidak valid",
          }
        }
        if (existingEmailsSet.has(r.email)) {
          return {
            ...r,
            status: "duplicate",
            message: "Email sudah terdaftar",
          }
        }
        return {
          ...r,
          status: "new",
        }
      })

      setParsedRows(validatedRows)
      toast.success(`Berhasil mengurai ${validatedRows.length} baris data dari file CSV.`)
    } catch (error) {
      console.error("Error parsing CSV:", error)
      toast.error("Gagal mengurai file CSV. Pastikan format file benar.")
    } finally {
      setIsParsing(false)
    }
  }

  async function handleImport() {
    const newUsers = parsedRows.filter((r) => r.status === "new")

    if (newUsers.length === 0) {
      toast.error("Tidak ada user baru (status BARU) untuk di-import.")
      return
    }

    setIsImporting(true)
    try {
      const payload = newUsers.map((u) => ({
        email: u.email,
        fullName: u.fullName,
        branch: u.branch,
        password: u.passwordDefault,
      }))

      const result = await importUsersBulk(payload)

      if (result.success) {
        toast.success(result.message)
        handleClose()
        onSuccess?.()
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("Terjadi kesalahan saat meng-import user massal.")
    } finally {
      setIsImporting(false)
    }
  }

  function handleClose() {
    setFile(null)
    setParsedRows([])
    setSearchQuery("")
    setStatusFilter("all")
    if (fileInputRef.current) fileInputRef.current.value = ""
    onOpenChange(false)
  }

  // Filter preview data
  const filteredRows = parsedRows.filter((r) => {
    const matchesSearch =
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.branch && r.branch.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "new" && r.status === "new") ||
      (statusFilter === "duplicate" && r.status === "duplicate")

    return matchesSearch && matchesStatus
  })

  const newCount = parsedRows.filter((r) => r.status === "new").length
  const duplicateCount = parsedRows.filter((r) => r.status === "duplicate").length
  const invalidCount = parsedRows.filter((r) => r.status === "invalid").length

  return (
    <Dialog open={open} onOpenChange={(open) => (open ? null : handleClose())}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFileSpreadsheet className="size-5 text-emerald-500" />
            Import User dari CSV
          </DialogTitle>
          <DialogDescription>
            Unggah file CSV dengan kolom `email`, `nama_lengkap`, `asal_cabang`, dan `coverage_cabang`.
          </DialogDescription>
        </DialogHeader>

        {/* Upload Area */}
        <div className="flex flex-col gap-4 py-4 min-h-0 flex-1">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all bg-muted/20 hover:bg-muted/40"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                <IconUpload className="size-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">Pilih File CSV</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Maksimal ukuran file 5MB. Gunakan file `unique` hasil filter.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border rounded-xl p-3 bg-muted/40">
              <div className="flex items-center gap-3">
                <IconFileSpreadsheet className="size-8 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                disabled={isParsing || isImporting}
                className="rounded-full shrink-0"
              >
                <IconX className="size-4" />
              </Button>
            </div>
          )}

          {isParsing && (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <IconLoader2 className="size-8 animate-spin text-emerald-500" />
              <p className="text-xs text-muted-foreground">Menganalisis data & memeriksa duplikasi...</p>
            </div>
          )}

          {/* Table Preview */}
          {parsedRows.length > 0 && (
            <div className="flex flex-col gap-3 min-h-0 flex-1 border rounded-xl p-3 bg-card shadow-sm">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                {/* Search */}
                <div className="relative w-full sm:max-w-64">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari nama, email, cabang..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs rounded-lg"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 bg-muted p-0.5 rounded-lg text-[10px] font-medium shrink-0">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`px-2.5 py-1 rounded-md transition-all ${statusFilter === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Semua ({parsedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("new")}
                    className={`px-2.5 py-1 rounded-md transition-all ${statusFilter === "new" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Baru ({newCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("duplicate")}
                    className={`px-2.5 py-1 rounded-md transition-all ${statusFilter === "duplicate" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Terdaftar ({duplicateCount})
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-auto border rounded-lg flex-1 min-h-24">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 font-semibold text-muted-foreground sticky top-0">
                      <th className="p-2 border-r w-24">Status</th>
                      <th className="p-2 border-r">Nama Lengkap</th>
                      <th className="p-2 border-r">Email</th>
                      <th className="p-2 border-r">Cabang Akses</th>
                      <th className="p-2">Password Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          Tidak ada baris data yang cocok dengan kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((r, index) => (
                        <tr key={index} className="border-b hover:bg-muted/10">
                          <td className="p-2 border-r">
                            {r.status === "new" ? (
                              <span className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-600 uppercase">
                                Baru
                              </span>
                            ) : r.status === "duplicate" ? (
                              <span className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500/10 text-amber-600 uppercase">
                                Terdaftar
                              </span>
                            ) : (
                              <span className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500/10 text-rose-600 uppercase">
                                Invalid
                              </span>
                            )}
                          </td>
                          <td className="p-2 border-r font-medium truncate max-w-44">{r.fullName}</td>
                          <td className="p-2 border-r text-muted-foreground truncate max-w-44">{r.email}</td>
                          <td className="p-2 border-r truncate max-w-36" title={r.branch || ""}>
                            {r.branch || "-"}
                          </td>
                          <td className="p-2 font-mono font-bold text-amber-700 bg-amber-500/5">{r.passwordDefault}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Status summary info */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  {newCount} akan ditambahkan.
                </span>
                <span className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-amber-500" />
                  {duplicateCount} akan dilewati (sudah terdaftar).
                </span>
                {invalidCount > 0 && (
                  <span className="flex items-center gap-1 text-rose-500 font-semibold">
                    <IconAlertCircle className="size-3" />
                    {invalidCount} format email tidak valid.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isImporting || isParsing}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isImporting || isParsing || newCount === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isImporting ? (
              <>
                <IconLoader2 className="size-4 animate-spin mr-1.5" />
                Meng-import ({newCount})...
              </>
            ) : (
              <>
                <IconCheck className="size-4 mr-1.5" />
                Mulai Import ({newCount} User)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
