"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { AuditStep1 } from "@/components/audit/step1"
import { AuditStep2 } from "@/components/audit/step2"
import { AuditStep3 } from "@/components/audit/step3"
import type { EquipmentMasterItem } from "@/lib/get-equipment-for-area"
import { useAuditStore, type StoreType } from "@/store/use-audit-store"
import * as React from "react"

type Props = {
  equipmentByArea: Record<string, EquipmentMasterItem[]>
  initialStore: {
    code: string
    name: string
    branch: string | null
    plnCustomerId: string | null
    type: string
    is24Hours: boolean
    openTime: string | null
    closeTime: string | null
    plnPowerVa: number
    parkingAreaM2: number
    terraceAreaM2: number
    salesAreaM2: number
    warehouseAreaM2: number
  }
}

export function AuditStartClient({ equipmentByArea, initialStore }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const step = searchParams.get("step") || "1"
  const stepNum = parseInt(step, 10)
  const selectedArea = searchParams.get("area")

  const setStoreIdentity = useAuditStore((s) => s.setStoreIdentity)
  const setStoreAreas = useAuditStore((s) => s.setStoreAreas)
  const hasInitialized = React.useRef(false)

  React.useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const isNew = searchParams.get("new") === "1"
    const state = useAuditStore.getState()
    
    // If the storage holds data for the SAME store AND it's not explicitly a new audit
    // This allows resuming after hard reloads!
    if (state.storeCode === initialStore.code && !isNew) {
      return
    }

    // New store or fresh session requested, clear old data and sync DB store identity
    useAuditStore.setState({ equipments: [], plnHistory: [], savedAreas: [] })
    
    setStoreIdentity({
      storeCode: initialStore.code,
      storeType: initialStore.type as StoreType,
      is24Hours: initialStore.is24Hours,
      openTime: initialStore.openTime || "07:00",
      closeTime: initialStore.closeTime || "22:00",
      plnPowerVa: initialStore.plnPowerVa,
    })
    setStoreAreas({
      sales: initialStore.salesAreaM2,
      parkir: initialStore.parkingAreaM2,
      teras: initialStore.terraceAreaM2,
      gudang: initialStore.warehouseAreaM2,
    })

    // Clean up URL so reloads don't wipe it again
    if (isNew) {
      router.replace("/audit/start", { scroll: false })
    }
  }, [initialStore, setStoreIdentity, setStoreAreas, searchParams, router])

  if (stepNum === 2) {
    return (
      <AuditStep2
        selectedArea={selectedArea}
        equipmentByArea={equipmentByArea}
      />
    )
  }

  if (stepNum === 3) {
    return <AuditStep3 />
  }

  return <AuditStep1 storeIdentity={initialStore} />
}
