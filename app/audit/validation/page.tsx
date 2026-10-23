import Link from "next/link"
import { redirect } from "next/navigation"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

import { ValidationFilters } from "@/components/audit-validation/validation-filters"
import { ValidationStoreList } from "@/components/audit-validation/validation-store-list"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { getAuditValidator } from "@/lib/audit-validation-access"
import {
  getValidationAudits,
  parseValidationFilters,
  TOP_BOROS_LIMIT,
  VALIDATION_PAGE_SIZE,
  type ValidationListFilters,
} from "@/lib/audit-validation-queries"

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function pageHref(filters: ValidationListFilters, page: number) {
  const params = new URLSearchParams()
  if (filters.result !== "all") params.set("result", filters.result)
  if (filters.status !== "all") params.set("status", filters.status)
  if (filters.q) params.set("q", filters.q)
  if (page > 1) params.set("page", String(page))
  const search = params.toString()
  return search ? `/audit/validation?${search}` : "/audit/validation"
}

export default async function AuditValidationPage({ searchParams }: Props) {
  const validator = await getAuditValidator()
  if (!validator) redirect("/forbidden")

  const filters = parseValidationFilters(await searchParams)
  const { rows, total } = await getValidationAudits(filters)

  const isTop = filters.view === "top"
  const totalPages = isTop ? 1 : Math.max(1, Math.ceil(total / VALIDATION_PAGE_SIZE))
  const startRank = isTop ? 1 : (filters.page - 1) * VALIDATION_PAGE_SIZE + 1
  const hasFilters = filters.result !== "all" || filters.status !== "all" || Boolean(filters.q)

  const emptyMessage = isTop
    ? "Tidak ada toko boros yang menunggu validasi."
    : hasFilters
      ? "Tidak ada toko yang cocok dengan filter ini."
      : "Belum ada kalkulasi toko yang selesai."

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md md:max-w-3xl flex-col bg-background px-4 md:px-6 pb-32">
      <Header
        variant="dashboard-back"
        title="Validasi Kalkulator Konsumsi Energi Toko"
        subtitle={
          isTop
            ? `${rows.length} toko boros dengan selisih PLN terbesar`
            : `${total} toko, diurutkan dari selisih PLN terbesar`
        }
        backHref="/dashboard"
        backLabel="Kembali ke Dashboard"
      />

      <main className="flex flex-col gap-3">
        <p className="px-1 text-xs text-muted-foreground">
          Buka toko, cocokkan alat dengan kondisi di lapangan, lalu validasi.
          Status hemat atau boros tetap sampai kalkulasi berikutnya.
        </p>

        <ValidationFilters filters={filters} topLimit={TOP_BOROS_LIMIT} />

        <ValidationStoreList
          rows={rows}
          startRank={startRank}
          emptyMessage={emptyMessage}
        />

        {totalPages > 1 && (
          <nav
            aria-label="Halaman daftar toko"
            className="flex items-center justify-between gap-2"
          >
            {filters.page > 1 ? (
              <Button asChild variant="outline" className="h-11">
                <Link href={pageHref(filters, filters.page - 1)}>
                  <IconChevronLeft data-icon="inline-start" />
                  Sebelumnya
                </Link>
              </Button>
            ) : (
              <span />
            )}
            <span className="text-xs text-muted-foreground tabular-nums">
              Halaman {filters.page} dari {totalPages}
            </span>
            {filters.page < totalPages ? (
              <Button asChild variant="outline" className="h-11">
                <Link href={pageHref(filters, filters.page + 1)}>
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
