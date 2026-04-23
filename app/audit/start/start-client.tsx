"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { AuditStep1 } from "@/components/audit/step1"
import { AuditStep2 } from "@/components/audit/step2"
import { AuditStep3 } from "@/components/audit/step3"
import type { EquipmentMasterItem } from "@/lib/get-equipment-for-area"
import { useAuditStore, type StoreType } from "@/store/use-audit-store"
import * as React from "react"

export type StoreData = {
  id: string
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

type Props = {
  stores: StoreData[]
  equipmentByArea: Record<string, EquipmentMasterItem[]>
}

export function AuditStartClient({ stores, equipmentByArea }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const step = searchParams.get("step") || "1"
  const stepNum = parseInt(step, 10)
  const selectedArea = searchParams.get("area")

  const setStoreIdentity = useAuditStore((s) => s.setStoreIdentity)
  const setStoreAreas = useAuditStore((s) => s.setStoreAreas)
  const storeCode = useAuditStore((s) => s.storeCode)
  const hasInitialized = React.useRef(false)

  // Reset store if ?new=1 is passed
  React.useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const isNew = searchParams.get("new") === "1"
    if (isNew) {
      useAuditStore.setState({
        storeCode: "",
        equipments: [],
        plnHistory: [],
        savedAreas: [],
      })
      router.replace("/audit/start", { scroll: false })
    }
  }, [searchParams, router])

  // Resolve the currently selected store from Zustand storeCode
  const selectedStore = stores.find((s) => s.code === storeCode) ?? null

  // If no store selected yet, always show Step 1
  const effectiveStep = selectedStore ? stepNum : 1

  if (effectiveStep === 2) {
    return (
      <AuditStep2
        selectedArea={selectedArea}
        equipmentByArea={equipmentByArea}
      />
    )
  }

  if (effectiveStep === 3) {
    return <AuditStep3 />
  }

  return (
    <AuditStep1
      stores={stores}
      selectedStore={selectedStore}
      onSelectStore={(store) => {
        useAuditStore.setState({ equipments: [], plnHistory: [], savedAreas: [] })
        setStoreIdentity({
          storeCode: store.code,
          storeType: store.type as StoreType,
          is24Hours: store.is24Hours,
          openTime: store.openTime || "07:00",
          closeTime: store.closeTime || "22:00",
          plnPowerVa: store.plnPowerVa,
        })
        setStoreAreas({
          sales: store.salesAreaM2,
          parkir: store.parkingAreaM2,
          teras: store.terraceAreaM2,
          gudang: store.warehouseAreaM2,
        })
      }}
    />
  )
}
