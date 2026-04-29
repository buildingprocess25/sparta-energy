import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type StoreType = "Regular" | "Basic" | "Medium" | "Advance" | "Dark Store" | "Drive Thru" | ""

export interface EquipmentState {
  id: string
  areaName: string // e.g. "Sales Area", "Teras", "Parkir", "Gudang, Toilet & Selasar"
  name: string
  brandId?: string
  brandName?: string
  brandIds?: (string | undefined)[]
  brandNames?: string[]
  kw: number
  kws?: number[]
  quantity: number
  startTimes: string[]
  endTimes: string[]
  selected: boolean
  isConfigured: boolean
}

export interface PlnRowState {
  month: string
  kwh: number
  std: number
}

export type DemoAuditResult = {
  id: string
  isBoros: boolean | null
  totalEstimatedKwhPerMonth: number | null
  avgActualPlnKwhPerMonth: number | null
  auditDate: string
  store: {
    code: string
    name: string
    salesAreaM2: number
    parkingAreaM2: number
    terraceAreaM2: number
    warehouseAreaM2: number
  }
  items: Array<{
    areaTarget: "SALES" | "PARKING" | "TERRACE" | "WAREHOUSE"
    customName: string | null
    qty: number
    operationalHours: number
    baseKw: number
    estimatedDailyKwh: number
  }>
  plnHistory: Array<{
    monthIdx: number
    billingMonth: string
    plnUsageKwh: number
    salesTransactionPerDay: number
  }>
  recommendations: Array<{
    type: "TRAINING" | "REPAIR" | "MAINTENANCE"
    title: string
    description: string
  }>
}

interface AuditState {
  // session tracking
  storeCode: string
  storeName: string

  // Step 1
  storeType: StoreType
  is24Hours: boolean
  openTime: string
  closeTime: string
  plnPowerVa: number
  areas: {
    sales: number
    parkir: number
    teras: number
    gudang: number
  }

  // Step 2
  equipments: EquipmentState[]
  savedAreas: string[]

  // Step 3
  plnHistory: PlnRowState[]
  demoAuditResult: DemoAuditResult | null

  // Actions
  setStoreIdentity: (data: Partial<AuditState>) => void
  setStoreAreas: (areas: Partial<AuditState["areas"]>) => void
  syncEquipmentsForArea: (areaName: string, items: EquipmentState[]) => void
  markAreaSaved: (areaName: string) => void
  setPlnHistory: (data: PlnRowState[]) => void
  setDemoAuditResult: (result: DemoAuditResult | null) => void
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      storeCode: "",
      storeName: "",

      storeType: "",
      is24Hours: true,
      openTime: "07:00",
      closeTime: "22:00",
      plnPowerVa: 0,
      areas: {
        sales: 0,
        parkir: 0,
        teras: 0,
        gudang: 0,
      },

      equipments: [],
      savedAreas: [],

      plnHistory: [],
      demoAuditResult: null,

      setStoreIdentity: (data) => set((state) => ({ ...state, ...data })),
      setStoreAreas: (areas) =>
        set((state) => ({ areas: { ...state.areas, ...areas } })),

      syncEquipmentsForArea: (areaName, items) =>
        set((state) => {
          // Remove old items for this area
          const otherAreas = state.equipments.filter(
            (e) => e.areaName !== areaName
          )
          // Add new items
          return { equipments: [...otherAreas, ...items] }
        }),

      markAreaSaved: (areaName) =>
        set((state) => ({
          savedAreas: state.savedAreas.includes(areaName)
            ? state.savedAreas
            : [...state.savedAreas, areaName],
        })),

      setPlnHistory: (data) => set({ plnHistory: data }),
      setDemoAuditResult: (result) => set({ demoAuditResult: result }),
    }),
    {
      name: "sparta-audit-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
