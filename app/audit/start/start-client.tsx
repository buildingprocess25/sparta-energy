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
  masterItems: EquipmentMasterItem[]
  basePath?: string
  dashboardPath?: string
  mode?: "live" | "demo"
}

export type AuditStepTarget = "step-1" | "step-2" | "step-2-detail" | "step-3"

export type AuditStepNavigateOptions = {
  areaId?: string
  areaName?: string
}

export type AuditStepNavigate = (
  target: AuditStepTarget,
  options?: AuditStepNavigateOptions
) => void

export function AuditStartClient({
  stores,
  masterItems,
  basePath = "/audit/start",
  dashboardPath = "/dashboard",
  mode = "live",
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const step = searchParams.get("step") || "1"
  const stepNum = parseInt(step, 10)
  const selectedArea = searchParams.get("area")
  const [pendingNavigation, setPendingNavigation] = React.useState<{
    step: AuditStepTarget
    areaId?: string
    areaName?: string
  } | null>(null)

  const setStoreIdentity = useAuditStore((s) => s.setStoreIdentity)
  const setStoreAreas = useAuditStore((s) => s.setStoreAreas)
  const storeCode = useAuditStore((s) => s.storeCode)
  const hasInitialized = React.useRef(false)

  const navigate = React.useCallback<AuditStepNavigate>(
    (target, options) => {
      const nextUrl =
        target === "step-1"
          ? `${basePath}?step=1`
          : target === "step-2"
            ? `${basePath}?step=2`
            : target === "step-2-detail"
              ? `${basePath}?step=2&area=${options?.areaId ?? ""}`
              : `${basePath}?step=3`

      setPendingNavigation({
        step: target,
        areaId: options?.areaId,
        areaName: options?.areaName,
      })
      router.push(nextUrl, { scroll: false })
    },
    [basePath, router]
  )

  // Reset store if ?new=1 is passed
  React.useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const isNew = searchParams.get("new") === "1"
    if (isNew) {
      useAuditStore.setState({
        storeCode: "",
        storeName: "",
        equipments: [],
        plnHistory: [],
        savedAreas: [],
        demoAuditResult: null,
      })
      router.replace(basePath, { scroll: false })
    }
  }, [searchParams, router, basePath])

  // Resolve the currently selected store from Zustand storeCode
  const selectedStore = stores.find((s) => s.code === storeCode) ?? null

  // If no store selected yet, always show Step 1
  const effectiveStep = selectedStore ? stepNum : 1

  React.useEffect(() => {
    setPendingNavigation(null)
  }, [step, selectedArea])

  const showSkeleton = Boolean(pendingNavigation)
  const viewStep = pendingNavigation
    ? pendingNavigation.step === "step-1"
      ? 1
      : pendingNavigation.step === "step-2"
        ? 2
        : pendingNavigation.step === "step-3"
          ? 3
          : 2
    : effectiveStep

  const viewAreaId =
    pendingNavigation?.step === "step-2-detail"
      ? (pendingNavigation.areaId ?? selectedArea)
      : selectedArea

  if (viewStep === 2) {
    return (
      <AuditStep2
        selectedArea={viewAreaId}
        masterItems={masterItems}
        basePath={basePath}
        onNavigate={navigate}
        showSkeleton={showSkeleton}
      />
    )
  }

  if (viewStep === 3) {
    return (
      <AuditStep3
        basePath={basePath}
        mode={mode}
        onNavigate={navigate}
        showSkeleton={showSkeleton}
      />
    )
  }

  return (
    <AuditStep1
      stores={stores}
      selectedStore={selectedStore}
      backHref={dashboardPath}
      onNavigate={navigate}
      showSkeleton={showSkeleton}
      onSelectStore={(store) => {
        useAuditStore.setState({
          equipments: [],
          plnHistory: [],
          savedAreas: [],
          demoAuditResult: null,
        })
        setStoreIdentity({
          storeCode: store.code,
          storeName: store.name,
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
