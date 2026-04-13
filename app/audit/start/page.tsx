import { Suspense } from "react"

import { AuditStartClient } from "./start-client"

export default function AuditStartPage() {
  return (
    <Suspense fallback={null}>
      <AuditStartClient />
    </Suspense>
  )
}
