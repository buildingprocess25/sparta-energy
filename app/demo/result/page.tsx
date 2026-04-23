"use client"

import Link from "next/link"

import { AuditResultDB } from "@/components/audit/result-db"
import { Button } from "@/components/ui/button"
import { useAuditStore } from "@/store/use-audit-store"

export default function DemoResultPage() {
  const demoAuditResult = useAuditStore((state) => state.demoAuditResult)

  if (!demoAuditResult) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-lg font-semibold">Hasil demo belum tersedia</h1>
        <p className="text-sm text-muted-foreground">
          Jalankan kalkulasi di mode demo terlebih dahulu.
        </p>
        <Button asChild>
          <Link href="/demo?new=1">Mulai Demo</Link>
        </Button>
      </main>
    )
  }

  return (
    <AuditResultDB
      audit={{
        ...demoAuditResult,
        auditDate: new Date(demoAuditResult.auditDate),
      }}
      dashboardHref="/demo?new=1"
      dashboardLabel="Ulangi Demo"
      showDownloadButton={false}
    />
  )
}
