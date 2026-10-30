// Copy of the v1.2.0 formula in app/ac-estimation/ac-estimation-client.tsx, which another
// team member owns; when that formula changes, change this one too (Tata Udara uses it).
export const AC_UNIT_BTU = 18000

// Target load per m² by the store's design temperature (2% exceedance, Open-Meteo).
export function getClusterBtu(maxTemp: number) {
  if (maxTemp > 35) return 751
  if (maxTemp < 27) return 450
  return 600
}

// Rounds down or up, whichever lands closer to the cluster target; at least one unit.
export function calculateAcUnits(salesAreaM2: number, maxTemp: number) {
  const clusterBtu = getClusterBtu(maxTemp)
  const totalBtu = salesAreaM2 * clusterBtu
  const downQty = Math.floor(totalBtu / AC_UNIT_BTU)
  const upQty = Math.ceil(totalBtu / AC_UNIT_BTU)
  const distDown = Math.abs((downQty * AC_UNIT_BTU) / salesAreaM2 - clusterBtu)
  const distUp = Math.abs((upQty * AC_UNIT_BTU) / salesAreaM2 - clusterBtu)
  const units = Math.max(1, distDown <= distUp ? downQty : upQty)

  return { clusterBtu, totalBtu, units }
}
