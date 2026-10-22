"use client"

import * as React from "react"
import { IconArrowRight } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { AuditStepSkeleton } from "@/components/audit/step-skeleton"
import { Header } from "@/components/header"
import { AuditStepIndicator } from "@/components/audit/step-indicator"
import { StoreCombobox } from "@/components/audit/store-combobox"
import { ExitAuditDialog } from "@/components/audit/exit-audit-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuditStore } from "@/store/use-audit-store"
import { saveAuditDraft } from "@/app/actions/save-draft"
import type {
  AuditStepNavigate,
  StoreData,
} from "@/app/audit/start/start-client"

type Props = {
  stores: StoreData[]
  selectedStore: StoreData | null
  backHref?: string
  onNavigate: AuditStepNavigate
  onSelectStore: (store: StoreData) => void
  showSkeleton?: boolean
}

export function AuditStep1({
  stores,
  selectedStore,
  backHref = "/dashboard",
  onNavigate,
  onSelectStore,
  showSkeleton = false,
}: Props) {
  const router = useRouter()
  const [isSavingDraft, setIsSavingDraft] = React.useState(false)
  const [showExitDialog, setShowExitDialog] = React.useState(false)
  const isExitingRef = React.useRef(false)

  const {
    auditId,
    storeType,
    is24Hours,
    openTime,
    closeTime,
    plnPowerVa,
    areas,
    equipments,
    savedAreas,
    plnHistory,
  } = useAuditStore()

  // Store type and technical data come from the store master; admins correct
  // them during validation, so the auditor only needs to pick the store.
  const isStep1Valid = Boolean(selectedStore)

  const handleNext = React.useCallback(() => {
    if (!isStep1Valid) return
    onNavigate("step-2")
  }, [isStep1Valid, onNavigate])

  const handleSaveDraft = React.useCallback(async () => {
    if (!selectedStore) return
    setIsSavingDraft(true)
    try {
      const result = await saveAuditDraft({
        auditId: auditId,
        storeCode: selectedStore.code,
        storeType: storeType,
        is24Hours: is24Hours,
        openTime: openTime,
        closeTime: closeTime,
        plnPowerVa: plnPowerVa,
        areas: areas,
        equipments: equipments,
        savedAreas: savedAreas,
        plnHistory: plnHistory,
      })

      if ("error" in result && result.error) {
        toast.error(result.error.message)
        setIsSavingDraft(false)
        isExitingRef.current = false
        return
      }

      toast.success("Draf kalkulasi berhasil disimpan!")

      // Reset the Zustand store
      useAuditStore.setState({
        auditId: null,
        storeCode: "",
        storeName: "",
        equipments: [],
        plnHistory: [],
        savedAreas: [],
        demoAuditResult: null,
      })

      router.push(backHref)
    } catch (e) {
      toast.error("Gagal menyimpan draf.")
      setIsSavingDraft(false)
      isExitingRef.current = false
    }
  }, [
    selectedStore,
    auditId,
    storeType,
    is24Hours,
    openTime,
    closeTime,
    plnPowerVa,
    areas,
    equipments,
    savedAreas,
    plnHistory,
    router,
    backHref,
  ])

  const handleBackClick = React.useCallback(() => {
    if (selectedStore) {
      setShowExitDialog(true)
    } else {
      router.push(backHref)
    }
  }, [selectedStore, router, backHref])

  const handleExitWithoutSave = React.useCallback(() => {
    isExitingRef.current = true
    setShowExitDialog(false)
    useAuditStore.setState({
      auditId: null,
      storeCode: "",
      storeName: "",
      equipments: [],
      plnHistory: [],
      savedAreas: [],
      demoAuditResult: null,
    })
    router.push(backHref)
  }, [router, backHref])

  const handleSaveAndExit = React.useCallback(async () => {
    isExitingRef.current = true
    await handleSaveDraft()
  }, [handleSaveDraft])

  // Guard browser reload or tab close
  React.useEffect(() => {
    if (!selectedStore) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isExitingRef.current) return
      e.preventDefault()
      e.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [selectedStore])

  // Guard browser back / mobile swipe back
  React.useEffect(() => {
    if (!selectedStore) return

    window.history.pushState({ auditStep1Guard: true }, "", window.location.href)

    const handlePopState = () => {
      if (isExitingRef.current) return
      // Re-push state so user remains on this page until they confirm
      window.history.pushState({ auditStep1Guard: true }, "", window.location.href)
      setShowExitDialog(true)
    }

    window.addEventListener("popstate", handlePopState)
    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [selectedStore])

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md md:max-w-4xl lg:max-w-5xl flex-col bg-background px-4 md:px-6 lg:px-8 pb-32">
      <Header
        variant="dashboard-back"
        title="Mulai Kalkulasi Baru"
        backHref={backHref}
        onBack={handleBackClick}
        className="px-0"
      />

      {selectedStore && (
        <ExitAuditDialog
          open={showExitDialog}
          onOpenChange={setShowExitDialog}
          storeName={selectedStore.name}
          storeCode={selectedStore.code}
          isSaving={isSavingDraft}
          onSaveAndExit={handleSaveAndExit}
          onExitWithoutSave={handleExitWithoutSave}
          onCancel={() => setShowExitDialog(false)}
        />
      )}

      <main className="flex flex-col gap-8">
        {showSkeleton ? (
          <AuditStepSkeleton variant="step-1" />
        ) : (
          <>
            {/* â”€â”€ Store Picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <section className="flex flex-col gap-4">
              <AuditStepIndicator currentStep={1} label="Step 1: Input Toko" />

              <h2 className="text-lg font-semibold text-primary">Pilih Toko</h2>

              <StoreCombobox
                stores={stores}
                value={selectedStore}
                onSelect={onSelectStore}
              />
            </section>

            {/* â”€â”€ Identitas & Teknis (hanya tampil setelah pilih toko) â”€â”€â”€â”€ */}
            {selectedStore && (
              <>
                <section className="flex flex-col gap-4">
                  <h2 className="text-lg font-semibold text-primary">
                    Identitas Toko
                  </h2>
                  <Card className="border-primary/10 bg-muted/30">
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            Kode Toko
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {selectedStore.code}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            Nama Toko
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {selectedStore.name}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            Cabang
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {selectedStore.branch || "-"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            ID PLN
                          </span>
                          <span className="text-xs font-semibold text-primary">
                            {selectedStore.plnCustomerId || "-"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            Tipe Toko
                          </span>
                          {storeType ? (
                            <span className="text-xs font-semibold text-foreground">
                              {storeType}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Belum diisi admin
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            Jam Operasional
                          </span>
                          {selectedStore.is24Hours ? (
                            <span className="text-xs font-semibold text-foreground">
                              24 jam
                            </span>
                          ) : selectedStore.openTime && selectedStore.closeTime ? (
                            <span className="text-xs font-semibold text-foreground tabular-nums">
                              {selectedStore.openTime} sampai {selectedStore.closeTime}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Belum diisi admin
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </>
            )}
          </>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-border/60 bg-background/90 p-4 backdrop-blur">
        <div className="w-full max-w-sm flex flex-col gap-2">
          {selectedStore && (
            <Button
              variant="outline"
              className="h-10 w-full rounded-xl text-xs"
              onClick={handleSaveDraft}
              disabled={showSkeleton || isSavingDraft}
            >
              {isSavingDraft ? "Menyimpan Draf..." : "Simpan Draf"}
            </Button>
          )}
          <Button
            className="h-11 w-full rounded-full"
            disabled={!isStep1Valid || showSkeleton || isSavingDraft}
            onClick={handleNext}
          >
            Lanjut ke Input Equipment
            <IconArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  )
}
