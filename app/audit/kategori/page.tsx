import Link from "next/link"
import { redirect } from "next/navigation"
import {
  IconChevronLeft,
  IconChevronRight,
  IconClipboardCheck,
  IconSearch,
} from "@tabler/icons-react"

import { AuditStatusBadge } from "@/components/energy-audit/audit-status-badge"
import { CategorySummary } from "@/components/energy-audit/category-summary"
import { EnergyAuditExportDialog } from "@/components/energy-audit/energy-audit-export-dialog"
import { formatGap } from "@/components/audit-validation/format"
import { ResultStatusBadge } from "@/components/audit-validation/result-status-badge"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { getAuditValidator } from "@/lib/audit-validation-access"
import {
  ENERGY_AUDIT_PAGE_SIZE,
  getEnergyAuditCandidates,
  getEnergyAuditExportOptions,
} from "@/lib/energy-audit-queries"

type Props = {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>
}

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" })

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function pageHref(q: string, page: number) {
  const params = new URLSearchParams()
  if (q) params.set("q", q)
  if (page > 1) params.set("page", String(page))
  const search = params.toString()
  return search ? `/audit/kategori?${search}` : "/audit/kategori"
}

export default async function EnergyAuditListPage({ searchParams }: Props) {
  const validator = await getAuditValidator()
  if (!validator) redirect("/forbidden")

  const params = await searchParams
  const q = (first(params.q) ?? "").trim().slice(0, 100)
  const pageNumber = Number(first(params.page))
  const page = Number.isInteger(pageNumber) && pageNumber > 1 ? pageNumber : 1

  const [{ rows, total }, exportOptions] = await Promise.all([
    getEnergyAuditCandidates({ q, page }),
    getEnergyAuditExportOptions(),
  ])
  const totalPages = Math.max(1, Math.ceil(total / ENERGY_AUDIT_PAGE_SIZE))

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background px-4 pb-32 md:max-w-3xl md:px-6">
      <Header
        variant="dashboard-back"
        title="Pemeriksaan Energi per Kategori"
        subtitle={`${total} toko boros yang sudah divalidasi`}
        backHref="/dashboard"
        backLabel="Kembali ke Dashboard"
      />

      <main className="flex flex-col gap-3">
        <p className="px-1 text-xs text-muted-foreground">
          Pilih toko untuk mulai pemeriksaan di lapangan. Toko yang
          pemeriksaannya belum lengkap tampil paling atas.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <form
            action="/audit/kategori"
            className="relative flex-1"
            role="search"
          >
            <IconSearch
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari nama atau kode toko"
              aria-label="Cari nama atau kode toko"
              className="h-11 pl-9"
            />
          </form>
          <EnergyAuditExportDialog options={exportOptions} />
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <IconClipboardCheck aria-hidden="true" className="size-6" />
            </div>
            <p className="max-w-xs text-sm font-semibold">
              {q
                ? "Tidak ada toko yang cocok dengan pencarian ini."
                : "Belum ada toko boros yang sudah divalidasi."}
            </p>
            {!q && (
              <p className="max-w-xs text-xs text-muted-foreground">
                Validasi kalkulasi toko boros dulu, lalu toko akan muncul di
                sini.
              </p>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((row) => (
              <li key={row.sourceAuditId}>
                <Item variant="outline" asChild className="bg-card">
                  <Link href={`/audit/kategori/${row.sourceAuditId}`}>
                    <ItemContent className="min-w-0">
                      <ItemTitle className="w-full truncate">
                        {row.storeName}
                      </ItemTitle>
                      <ItemDescription className="truncate">
                        {row.storeCode}
                        {row.branch ? ` · ${row.branch}` : ""} · kalkulasi{" "}
                        {dateFormat.format(new Date(row.auditDate))}
                      </ItemDescription>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {row.isSangatBoros && (
                          <ResultStatusBadge isBoros isSangatBoros />
                        )}
                        <span className="text-xs font-medium text-muted-foreground tabular-nums">
                          {row.completedCount} dari {row.categories.length}{" "}
                          kategori selesai
                        </span>
                      </div>
                      <ul className="flex flex-col gap-1 pt-1">
                        {row.categories.map((category) => (
                          <li
                            key={category.key}
                            className="flex flex-wrap items-center gap-1.5"
                          >
                            <span className="text-xs text-muted-foreground">
                              {category.label.replace("Sistem ", "")}:
                            </span>
                            <AuditStatusBadge status={category.status} />
                            <CategorySummary
                              category={category.key}
                              status={category.status}
                              summaryStatus={category.summaryStatus}
                            />
                          </li>
                        ))}
                      </ul>
                    </ItemContent>
                    {row.gapPercent !== null && (
                      <ItemActions className="flex-col items-end gap-0.5">
                        <span className="text-sm font-bold text-[#b23f39] tabular-nums dark:text-[#e07a74]">
                          {formatGap(row.gapPercent)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          dari standar
                        </span>
                      </ItemActions>
                    )}
                    <IconChevronRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                  </Link>
                </Item>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Halaman daftar toko"
            className="flex items-center justify-between gap-2"
          >
            {page > 1 ? (
              <Button asChild variant="outline" className="h-11">
                <Link href={pageHref(q, page - 1)}>
                  <IconChevronLeft data-icon="inline-start" />
                  Sebelumnya
                </Link>
              </Button>
            ) : (
              <span />
            )}
            <span className="text-xs text-muted-foreground tabular-nums">
              Halaman {page} dari {totalPages}
            </span>
            {page < totalPages ? (
              <Button asChild variant="outline" className="h-11">
                <Link href={pageHref(q, page + 1)}>
                  Berikutnya
                  <IconChevronRight data-icon="inline-end" />
                </Link>
              </Button>
            ) : (
              <span />
            )}
          </nav>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
