"use client"

import { useSearchParams } from "next/navigation"

import { AuditStep1 } from "@/components/audit/step1"
import { AuditStep2 } from "@/components/audit/step2"
import { AuditStep3 } from "@/components/audit/step3"
import { AuditResult } from "@/components/audit/result"

export function AuditStartClient() {
  const searchParams = useSearchParams()
  const step = searchParams.get("step") || "1"
  const stepNum = parseInt(step, 10)
  const selectedArea = searchParams.get("area")

  if (stepNum === 2) {
    return <AuditStep2 selectedArea={selectedArea} />
  }

  if (stepNum === 3) {
    return <AuditStep3 />
  }

  if (stepNum === 4) {
    return <AuditResult />
  }

  return <AuditStep1 />
}
