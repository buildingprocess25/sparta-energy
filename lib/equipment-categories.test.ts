import assert from "node:assert/strict"

import {
  DEVICE_CATEGORIES,
  isDeviceCategory,
  mapLegacyDeviceCategory,
} from "./equipment-categories"

assert.equal(DEVICE_CATEGORIES.length, 7)
assert.equal(isDeviceCategory("Kitchen & Food Processing (Beanspot)"), true)
assert.equal(isDeviceCategory("VAC"), true)
assert.equal(isDeviceCategory("HVAC"), false)
assert.equal(isDeviceCategory("Sistem Refrigerasi"), false)
assert.equal(isDeviceCategory("Pencahayaan"), false)
assert.equal(isDeviceCategory(undefined), false)

// Master rows as they were on 4 Nov 2026: [name, area category, old device category, expected].
const rows: [string, string, string, string][] = [
  ["Polesign", "PARKIRAN", "Sistem Tata Cahaya", "Signage & Display"],
  ["Shop Sign TL LED", "PARKIRAN", "Pencahayaan", "Signage & Display"],
  ["Listplank TL LED", "PARKIRAN", "Sistem Tata Cahaya", "Signage & Display"],
  ["Lampu Bohlam 9 Watt (Sensor)", "GUDANG", "Pencahayaan", "Lighting"],
  ["Lampu area sales TL", "SALES", "Sistem Tata Cahaya", "Lighting"],
  ["Air Conditioner", "SALES", "Sistem Tata Udara dan Ventilasi", "VAC"],
  ["Air Conditioner", "SALES", "Sistem HVAC", "VAC"],
  ["Exhaust Fan Ceiling 10 inch", "GUDANG", "Lainnya", "VAC"],
  ["Freezer", "SALES", "Sistem Refrigerasi", "Refrigeration"],
  ["Display Cooler (Chiller)", "SALES", "Sistem Pendingin Produk", "Refrigeration"],
  ["Chest Freezer 460 L", "BEANSPOT", "Sistem Pendingin Produk", "Kitchen & Food Processing (Beanspot)"],
  ["Oven", "BEANSPOT", "Sistem Beanspot", "Kitchen & Food Processing (Beanspot)"],
  ["Lampu Sorot (Track Light)", "BEANSPOT", "Pencahayaan", "Kitchen & Food Processing (Beanspot)"],
  ["Paket Kasir", "GUDANG", "Lainnya", "POS"],
  ["Mesin ATM", "SALES", "Lainnya", "POS"],
  ["Tenant", "PARKIRAN", "Tenant", "Other Equipment"],
  ["Paket CCTV", "GUDANG", "Lainnya", "Other Equipment"],
  ["Pompa Air", "TERAS", "Lainnya", "Other Equipment"],
  // Rows already on a current category keep it.
  ["Speaker", "SALES", "POS", "POS"],
]
for (const [name, category, deviceCategory, expected] of rows) {
  assert.equal(
    mapLegacyDeviceCategory({ name, category, deviceCategory }),
    expected,
    `${name} (${category}/${deviceCategory})`
  )
}

console.log("equipment-categories tests passed")
