import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type StoreType = "Regular" | "Basic" | "Medium" | "Advance"

export interface EquipmentState {
  id: string
  areaName: string // e.g. "Sales Area", "Teras", "Parkir", "Gudang, Toilet & Selasar"
  name: string
  watt: number
  quantity: number
  startTimes: string[]
  endTimes: string[]
  selected: boolean
}

export interface PlnRowState {
  month: string
  kwh: number
  std: number
}

interface AuditState {
  // session tracking
  storeCode: string

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

  // Actions
  setStoreIdentity: (data: Partial<AuditState>) => void
  setStoreAreas: (areas: Partial<AuditState["areas"]>) => void
  syncEquipmentsForArea: (areaName: string, items: EquipmentState[]) => void
  markAreaSaved: (areaName: string) => void
  setPlnHistory: (data: PlnRowState[]) => void
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      storeCode: "",

      storeType: "Regular",
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

      setStoreIdentity: (data) => set((state) => ({ ...state, ...data })),
      setStoreAreas: (areas) => set((state) => ({ areas: { ...state.areas, ...areas } })),
      
      syncEquipmentsForArea: (areaName, items) => set((state) => {
        // Remove old items for this area
        const otherAreas = state.equipments.filter(e => e.areaName !== areaName)
        // Add new items
        return { equipments: [...otherAreas, ...items] }
      }),
      
      markAreaSaved: (areaName) => set((state) => ({
        savedAreas: state.savedAreas.includes(areaName) ? state.savedAreas : [...state.savedAreas, areaName]
      })),

      setPlnHistory: (data) => set({ plnHistory: data }),
    }),
    {
      name: "sparta-audit-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
