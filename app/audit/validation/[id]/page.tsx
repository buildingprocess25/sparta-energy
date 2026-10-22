import { notFound, redirect } from "next/navigation"

import {
  ValidationDetail,
  type ValidationStep,
} from "@/components/audit-validation/validation-detail"
import { getAuditValidator } from "@/lib/audit-validation-access"
import { getValidationAudit } from "@/lib/audit-validation-queries"
import { getAllEquipmentMaster } from "@/lib/get-equipment-for-area"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ step?: string | string[] }>
}

function parseStep(value: string | string[] | undefined): ValidationStep {
  const step = Number(Array.isArray(value) ? value[0] : value)
  return step === 2 || step === 3 ? step : 1
}

export default async function AuditValidationDetailPage({
  params,
  searchParams,
}: Props) {
  const validator = await getAuditValidator()
  if (!validator) redirect("/forbidden")

  const [{ id }, { step }] = await Promise.all([params, searchParams])
  const [audit, equipmentMaster] = await Promise.all([
    getValidationAudit(id),
    getAllEquipmentMaster(),
  ])

  if (!audit) notFound()

  return (
    <ValidationDetail
      audit={audit}
      equipmentMaster={equipmentMaster}
      step={parseStep(step)}
    />
  )
}
