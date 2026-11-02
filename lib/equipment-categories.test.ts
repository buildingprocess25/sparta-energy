import assert from "node:assert/strict"

import {
  DEVICE_CATEGORIES,
  isDeviceCategory,
  mapLegacyDeviceCategory,
} from "./equipment-categories"

assert.equal(DEVICE_CATEGORIES.length, 5)
assert.equal(isDeviceCategory("Sistem Refrigerasi"), true)
assert.equal(isDeviceCategory("Pencahayaan"), false)
assert.equal(isDeviceCategory(undefined), false)

// Master rows as they were on 30 Oct 2026: [name, area category, old device category, expected].
const rows: [string, string, string, string][] = [
  ["Polesign", "PARKIRAN", "Pencahayaan", "Sistem Tata Cahaya"],
  ["Lampu Bohlam 9 Watt (Sensor)", "GUDANG", "Pencahayaan", "Sistem Tata Cahaya"],
  ["Lampu area sales TL", "SALES", "Sistem Tata Cahaya", "Sistem Tata Cahaya"],
  ["Air Conditioner", "SALES", "Sistem Tata Udara dan Ventilasi", "Sistem Tata Udara dan Ventilasi"],
  ["Air Conditioner", "SALES", "Sistem HVAC", "Sistem Tata Udara dan Ventilasi"],
  ["Exhaust Fan Ceiling 10 inch", "GUDANG", "Lainnya", "Sistem Tata Udara dan Ventilasi"],
  ["Exhaust Fan Ceiling 10 inch (Chiller)", "SALES", "Lainnya", "Sistem Tata Udara dan Ventilasi"],
  ["Freezer", "SALES", "Sistem Pendingin Produk", "Sistem Refrigerasi"],
  ["Chest Freezer 460 L", "BEANSPOT", "Sistem Pendingin Produk", "Sistem Beanspot"],
  ["Oven", "BEANSPOT", "Pemanas", "Sistem Beanspot"],
  ["Lampu Sorot (Track Light)", "BEANSPOT", "Pencahayaan", "Sistem Beanspot"],
  ["Coffee Maker", "BEANSPOT", "Lainnya", "Sistem Beanspot"],
  ["Tenant", "PARKIRAN", "Tenant", "Lainnya"],
  ["Paket CCTV", "GUDANG", "Lainnya", "Lainnya"],
  ["Pompa Air", "TERAS", "Lainnya", "Lainnya"],
]
for (const [name, category, deviceCategory, expected] of rows) {
  assert.equal(
    mapLegacyDeviceCategory({ name, category, deviceCategory }),
    expected,
    `${name} (${category}/${deviceCategory})`
  )
}

console.log("equipment-categories tests passed")
