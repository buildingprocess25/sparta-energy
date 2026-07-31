import assert from "node:assert/strict"
import { NextRequest } from "next/server"

import { POST } from "@/app/api/cron/sync-stores/route"
import {
  filterNewStores,
  parseStoreSheetRows,
} from "@/lib/jobs/sync-stores"

const stores = parseStoreSheetRows([
  ["Store Name", "branch_name", "Store-Code", "F/R", "Titik Koordinat"],
  ["Toko Satu", "SIDOARJO", "u001", "R", "0.50954 101.4494"],
  ["Toko Dua", "MALANG", "U002", "F", "0.56754 101.45326"],
  ["Toko Dua", "MALANG", "U002", "F", "0.56754 101.45326"],
  ["", "", "", "", ""],
])

assert.deepEqual(stores, [
  {
    code: "U001",
    name: "Toko Satu",
    branch: "SIDOARJO",
    latitude: 0.50954,
    longitude: 101.4494,
  },
  {
    code: "U002",
    name: "Toko Dua",
    branch: "MALANG",
    latitude: 0.56754,
    longitude: 101.45326,
  },
])

assert.deepEqual(filterNewStores(stores, new Set(["U001"])), [
  {
    code: "U002",
    name: "Toko Dua",
    branch: "MALANG",
    latitude: 0.56754,
    longitude: 101.45326,
  },
])

const incompleteStores = parseStoreSheetRows([
  ["Kode Toko", "Nama Toko", "Cabang"],
  ["U003", "", "TEGAL"],
  ["", "", "", "masih berisi data"],
  ["U004", "Toko Empat", "TEGAL"],
])

assert.deepEqual(incompleteStores, [
  {
    code: "U004",
    name: "Toko Empat",
    branch: "TEGAL",
    latitude: null,
    longitude: null,
  },
])

const duplicateStores = parseStoreSheetRows([
  ["Kode Toko", "Nama Toko", "Cabang"],
  ["U004", "Toko Lama", "TEGAL"],
  ["U004", "Toko Baru", "TEGAL"],
])

assert.deepEqual(duplicateStores, [
  {
    code: "U004",
    name: "Toko Lama",
    branch: "TEGAL",
    latitude: null,
    longitude: null,
  },
])

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
