import { notFound, redirect } from "next/navigation"

import { HvacAuditForm } from "@/components/energy-audit/hvac-audit-form"
import { getAuditValidator } from "@/lib/audit-validation-access"
import { getHvacAuditForm } from "@/lib/energy-audit-queries"

type Props = {
  params: Promise<{ id: string }>
}

export default async function HvacAuditPage({ params }: Props) {
  const validator = await getAuditValidator()
  if (!validator) redirect("/forbidden")

  const { id } = await params
  const form = await getHvacAuditForm(id)
  if (!form) notFound()

  return (
    <HvacAuditForm
      form={form}
      currentAuditor={validator.fullName ?? validator.email}
    />
  )
}
