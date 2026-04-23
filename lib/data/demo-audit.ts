import type { StoreData } from "@/app/audit/start/start-client"
import type { EquipmentMasterItem } from "@/lib/get-equipment-for-area"

export const demoStores: StoreData[] = [
  {
    id: "demo-store-1",
    code: "DEM1",
    name: "SPARTA Demo Store",
    branch: "DEMO",
    plnCustomerId: "0000000000",
    type: "",
    is24Hours: false,
    openTime: "07:00",
    closeTime: "22:00",
    plnPowerVa: 0,
    parkingAreaM2: 0,
    terraceAreaM2: 0,
    salesAreaM2: 0,
    warehouseAreaM2: 0,
  },
]

export const demoEquipmentByArea: Record<string, EquipmentMasterItem[]> = {
  Sales: [
    {
      id: "demo-sales-1",
      name: "Lampu LED 18W",
      category: "SALES",
      defaultKw: 0.018,
    },
    {
      id: "demo-sales-2",
      name: "AC Cassette 2 PK",
      category: "SALES",
      defaultKw: 1.8,
    },
    {
      id: "demo-sales-3",
      name: "Showcase Chiller",
      category: "SALES",
      defaultKw: 0.45,
    },
    {
      id: "demo-sales-4",
      name: "POS Computer",
      category: "SALES",
      defaultKw: 0.12,
    },
    {
      id: "demo-sales-5",
      name: "Coffee Machine",
      category: "BEANSPOT",
      defaultKw: 1.2,
    },
    {
      id: "demo-sales-6",
      name: "Coffee Grinder",
      category: "BEANSPOT",
      defaultKw: 0.35,
    },
  ],
  Teras: [
    {
      id: "demo-teras-1",
      name: "Lampu Signage",
      category: "TERAS",
      defaultKw: 0.08,
    },
    {
      id: "demo-teras-2",
      name: "Lampu Sorot",
      category: "TERAS",
      defaultKw: 0.05,
    },
  ],
  Parkiran: [
    {
      id: "demo-parkir-1",
      name: "Lampu Parkir LED",
      category: "PARKIRAN",
      defaultKw: 0.03,
    },
    {
      id: "demo-parkir-2",
      name: "CCTV Outdoor",
      category: "PARKIRAN",
      defaultKw: 0.015,
    },
  ],
  "Gudang, Toilet & Selasar": [
    {
      id: "demo-gudang-1",
      name: "Exhaust Fan",
      category: "GUDANG",
      defaultKw: 0.06,
    },
    {
      id: "demo-gudang-2",
      name: "Pompa Air",
      category: "GUDANG",
      defaultKw: 0.25,
    },
    {
      id: "demo-gudang-3",
      name: "Lampu Gudang",
      category: "GUDANG",
      defaultKw: 0.02,
    },
  ],
}
