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
  parseValidationFilters,
  type ValidationListFilters,
} from "@/lib/audit-validation-filters"
import {
  getValidationAudits,
  VALIDATION_PAGE_SIZE,
} from "@/lib/audit-validation-queries"

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function pageHref(filters: ValidationListFilters, page: number) {
  const params = new URLSearchParams()
  if (filters.result !== "all") params.set("result", filters.result)
  if (filters.status !== "pending") params.set("status", filters.status)
  if (filters.gap !== "all") params.set("gap", filters.gap)
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

  const totalPages = Math.max(1, Math.ceil(total / VALIDATION_PAGE_SIZE))
  const hasFilters =
    filters.result !== "all" || filters.gap !== "all" || Boolean(filters.q)

  const subtitle = {
    pending: `${total} toko menunggu validasi, diurutkan dari selisih PLN terbesar`,
    validated: `${total} toko sudah divalidasi`,
    all: `${total} toko, diurutkan dari selisih PLN terbesar`,
  }[filters.status]

  const emptyMessage = hasFilters
    ? "Tidak ada toko yang cocok dengan filter ini."
    : {
        pending: "Semua toko sudah divalidasi.",
        validated: "Belum ada toko yang divalidasi.",
        all: "Belum ada kalkulasi toko yang selesai.",
      }[filters.status]

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background px-4 pb-32 md:max-w-3xl md:px-6">
      <Header
        variant="dashboard-back"
        title="Validasi Kalkulator Konsumsi Energi Toko"
        subtitle={subtitle}
        backHref="/dashboard"
        backLabel="Kembali ke Dashboard"
      />

      <main className="flex flex-col gap-3">
        <ValidationFilters filters={filters} />

        <ValidationStoreList rows={rows} emptyMessage={emptyMessage} />

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
