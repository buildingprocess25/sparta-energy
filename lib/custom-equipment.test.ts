import assert from "node:assert/strict"

import {
  isUploadThingUrl,
  selectCustomEquipment,
  syncCustomEquipmentSubmissions,
  typeCategoryFor,
} from "./custom-equipment"
import type { EquipmentState } from "@/store/use-audit-store"

assert.equal(isUploadThingUrl("https://utfs.io/f/abc"), true)
assert.equal(isUploadThingUrl("https://x1y2.ufs.sh/f/abc"), true)
assert.equal(isUploadThingUrl("http://utfs.io/f/abc"), false)
assert.equal(isUploadThingUrl("https://evil.com/utfs.io/abc"), false)
assert.equal(isUploadThingUrl("https://utfs.io.evil.com/f/abc"), false)
assert.equal(isUploadThingUrl("not a url"), false)
assert.equal(isUploadThingUrl(undefined), false)

assert.equal(typeCategoryFor("Sistem Beanspot", "WAREHOUSE"), "BEANSPOT")
assert.equal(typeCategoryFor("Lainnya", "PARKING"), "PARKIRAN")
assert.equal(typeCategoryFor("Sistem Refrigerasi", "TERRACE"), "TERAS")

function equipment(overrides: Partial<EquipmentState>): EquipmentState {
  return {
    id: overrides.name ?? "eq",
    areaName: "Sales",
    name: "Steamer Bakpao",
    kw: 1.1,
    kws: [1.1],
    quantity: 1,
    startTimes: ["07:00"],
    endTimes: ["22:00"],
    selected: true,
    isConfigured: true,
    customDeviceCategory: "Sistem Beanspot",
    customPhotoUrl: "https://utfs.io/f/steamer",
    ...overrides,
  }
}

const master = new Set(["freezer"])
const picked = selectCustomEquipment(
  [
    equipment({ id: "ok" }),
    equipment({ id: "master", name: " Freezer " }),
    equipment({ id: "old-custom", customDeviceCategory: undefined, customPhotoUrl: undefined }),
    equipment({ id: "bad-category", customDeviceCategory: "Pemanas" }),
    equipment({ id: "bad-photo", customPhotoUrl: "https://example.com/a.jpg" }),
    equipment({ id: "unselected", selected: false }),
  ],
  master
)
// Only new-form custom equipment outside the master is submitted; older custom
// items without category and photo count as already reviewed.
assert.deepEqual(picked.map((eq) => eq.id), ["ok"])

// In-memory stand-in for the transaction client.
type Row = { id: string; auditId: string; name: string; status: string; [key: string]: unknown }
function fakeTx(rows: Row[]) {
  let nextId = 1
  return {
    rows,
    customEquipmentSubmission: {
      findMany: async ({ where }: { where: { auditId: string } }) =>
        rows.filter((r) => r.auditId === where.auditId && r.status !== "PENDING"),
      deleteMany: async ({ where }: { where: { auditId: string } }) => {
        for (let i = rows.length - 1; i >= 0; i--) {
          if (rows[i].auditId === where.auditId && rows[i].status === "PENDING") rows.splice(i, 1)
        }
      },
      create: async ({ data }: { data: Omit<Row, "id" | "status"> }) => {
        const row = { ...data, id: `new-${nextId++}`, status: "PENDING" } as Row
        rows.push(row)
        return { id: row.id }
      },
    },
  }
}

async function run() {
  const tx = fakeTx([
    { id: "old-pending", auditId: "a1", name: "Steamer Bakpao", status: "PENDING" },
    { id: "approved", auditId: "a1", name: "Food Warmer", status: "APPROVED" },
    { id: "other-audit", auditId: "a2", name: "Steamer Bakpao", status: "PENDING" },
  ])
  const ids = await syncCustomEquipmentSubmissions(tx as never, {
    auditId: "a1",
    storeId: "s1",
    userId: "u1",
    equipments: [
      equipment({ id: "steamer" }),
      equipment({ id: "warmer", name: "food warmer" }),
      equipment({ id: "freezer", name: "Freezer" }),
    ],
    masterNames: master,
    toAreaTarget: () => "SALES",
  })

  // Resubmit replaces this audit's pending row, reuses the reviewed one by name,
  // and leaves other audits alone.
  assert.equal(ids.get("steamer"), "new-1")
  assert.equal(ids.get("warmer"), "approved")
  assert.equal(ids.has("freezer"), false)
  assert.deepEqual(
    tx.rows.map((r) => r.id).sort(),
    ["approved", "new-1", "other-audit"]
  )
  const created = tx.rows.find((r) => r.id === "new-1")!
  assert.equal(created.deviceCategory, "Sistem Beanspot")
  assert.equal(created.productPhotoUrl, "https://utfs.io/f/steamer")
  assert.equal(created.baseKw, 1.1)
  assert.equal(created.storeId, "s1")
  assert.equal(created.submittedById, "u1")

  // Removing every custom item clears the audit's pending submissions.
  await syncCustomEquipmentSubmissions(tx as never, {
    auditId: "a1",
    storeId: "s1",
    userId: "u1",
    equipments: [],
    masterNames: master,
    toAreaTarget: () => "SALES",
  })
  assert.deepEqual(tx.rows.map((r) => r.id).sort(), ["approved", "other-audit"])

  console.log("custom-equipment tests passed")
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
