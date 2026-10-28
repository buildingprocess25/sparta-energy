import { notFound, redirect } from "next/navigation"

import { ValidationDetail } from "@/components/audit-validation/validation-detail"
import { getAuditValidator } from "@/lib/audit-validation-access"
import { getValidationAudit } from "@/lib/audit-validation-queries"
import { getAllEquipmentMaster } from "@/lib/get-equipment-for-area"

type Props = {
  params: Promise<{ id: string }>
}

// Old links may still carry ?step=; the page has a single view now, so it is ignored.
export default async function AuditValidationDetailPage({ params }: Props) {
  const validator = await getAuditValidator()
  if (!validator) redirect("/forbidden")

  const { id } = await params
  const [audit, equipmentMaster] = await Promise.all([
    getValidationAudit(id),
    getAllEquipmentMaster(),
  ])

  if (!audit) notFound()

  return <ValidationDetail audit={audit} equipmentMaster={equipmentMaster} />
}
