import { notFound, redirect } from "next/navigation"

import { LightingAuditForm } from "@/components/energy-audit/lighting-audit-form"
import { getAuditValidator } from "@/lib/audit-validation-access"
import { getLightingAuditForm } from "@/lib/energy-audit-queries"

type Props = {
  params: Promise<{ id: string }>
}

export default async function LightingAuditPage({ params }: Props) {
  const validator = await getAuditValidator()
  if (!validator) redirect("/forbidden")

  const { id } = await params
  const form = await getLightingAuditForm(id)
  if (!form) notFound()

  return (
    <LightingAuditForm
      form={form}
      currentAuditor={validator.fullName ?? validator.email}
    />
  )
}
