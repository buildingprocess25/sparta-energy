"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { acUnavailableMessage } from "@/components/dashboard/ac-estimation-card"

function AcEstimationUnavailableNotice() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("notice") !== "ac-estimation-unavailable") return

    toast.info("Kalkulator AC sementara dinonaktifkan", {
      description: acUnavailableMessage,
    })
    router.replace("/dashboard")
  }, [router, searchParams])

  return null
}

export { AcEstimationUnavailableNotice }
