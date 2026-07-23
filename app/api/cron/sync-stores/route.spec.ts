import assert from "node:assert/strict"
import { NextRequest } from "next/server"

import { POST } from "@/app/api/cron/sync-stores/route"
import {
  filterNewStores,
  parseStoreSheetRows,
} from "@/lib/jobs/sync-stores"

const stores = parseStoreSheetRows([
  ["Store Name", "branch_name", "Store-Code"],
  ["Toko Satu", "SIDOARJO", "u001"],
  ["Toko Dua", "MALANG", "U002"],
  ["Toko Dua", "MALANG", "U002"],
  ["", "", ""],
])

assert.deepEqual(stores, [
  { code: "U001", name: "Toko Satu", branch: "SIDOARJO" },
  { code: "U002", name: "Toko Dua", branch: "MALANG" },
])

assert.deepEqual(filterNewStores(stores, new Set(["U001"])), [
  { code: "U002", name: "Toko Dua", branch: "MALANG" },
])

assert.throws(
  () =>
    parseStoreSheetRows([
      ["Kode Toko", "Nama Toko", "Cabang"],
      ["U003", "", "TEGAL"],
    ]),
  /Baris 2 tidak lengkap/
)

assert.throws(
  () =>
    parseStoreSheetRows([
      ["Kode Toko", "Nama Toko", "Cabang", "Catatan"],
      ["", "", "", "masih berisi data"],
    ]),
  /Baris 2 tidak lengkap/
)

assert.throws(
  () =>
    parseStoreSheetRows([
      ["Kode Toko", "Nama Toko", "Cabang"],
      ["U004", "Toko Lama", "TEGAL"],
      ["U004", "Toko Baru", "TEGAL"],
    ]),
  /Kode toko duplikat U004/
)

const originalCronSecret = process.env.CRON_SECRET
const requestUrl = "http://localhost/api/cron/sync-stores"

try {
  delete process.env.CRON_SECRET

  let response = await POST(
    new NextRequest(requestUrl, {
      method: "POST",
    })
  )
  assert.equal(response.status, 500)
  assert.deepEqual(await response.json(), { error: "Server misconfigured" })

  process.env.CRON_SECRET = "test-cron-secret"

  response = await POST(
    new NextRequest(requestUrl, {
      method: "POST",
    })
  )
  assert.equal(response.status, 401)
  assert.deepEqual(await response.json(), { error: "Unauthorized" })

  response = await POST(
    new NextRequest(requestUrl, {
      method: "POST",
      headers: {
        authorization: "Bearer wrong-secret",
      },
    })
  )
  assert.equal(response.status, 401)
  assert.deepEqual(await response.json(), { error: "Unauthorized" })
} finally {
  if (originalCronSecret === undefined) {
    delete process.env.CRON_SECRET
  } else {
    process.env.CRON_SECRET = originalCronSecret
  }
}

console.log("store sync self-check passed")
