"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { AuditStep1 } from "@/components/audit/step1"
import { AuditStep2 } from "@/components/audit/step2"

export default function AuditStartPage() {
  const searchParams = useSearchParams()
  const step = searchParams.get("step") || "1"
  const stepNum = parseInt(step, 10)
  const selectedArea = searchParams.get("area")

  if (stepNum === 2) {
    return <AuditStep2 selectedArea={selectedArea} />
  }

  return <AuditStep1 />
}
