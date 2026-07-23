# Store Sync Cron Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a private Dokploy-triggered endpoint that reads the existing store Google Sheet and inserts only new SPARTA Energy stores.

**Architecture:** A single server-only module handles OAuth, Sheet retrieval, parsing, existing-code filtering, and Prisma insertion. A Next.js route performs Bearer authentication and calls that module, while `proxy.ts` bypasses Better Auth only for the exact cron path. One `tsx` self-check covers the parser, filter, and unauthenticated route responses without contacting Google or PostgreSQL.

**Tech Stack:** Next.js 16 App Router, TypeScript, native `fetch`, `URLSearchParams`, Prisma 7, Node `assert`, `tsx`

## Global Constraints

- The endpoint is exactly `POST /api/cron/sync-stores`.
- Authentication is exactly `Authorization: Bearer <CRON_SECRET>`.
- Synchronization is insert-only: never update or delete existing stores.
- Use the same Google Sheet and header aliases as SPARTA Maintenance.
- Use native `fetch` and `URLSearchParams`; do not add `googleapis` or another dependency.
- Do not change the Prisma schema or create a migration.
- Do not add a second CLI wrapper.
- Dokploy owns the once-daily schedule, timezone, and cron expression.
- Automated checks must not call live Google APIs or PostgreSQL.
- Preserve the two user-owned CSV deletions and the untracked `.claude/` directory; never stage them.

---

## File Map

- Create `lib/jobs/sync-stores.ts`: Google OAuth, Sheet retrieval, parsing, filtering, and insert-only Prisma write.
- Create `app/api/cron/sync-stores/route.ts`: `CRON_SECRET` validation and JSON responses.
- Create `app/api/cron/sync-stores/route.spec.ts`: the one runnable parser/filter/auth self-check.
- Modify `proxy.ts:23-26`: bypass Better Auth for the exact cron route.
- Leave `package.json`, `prisma/schema.prisma`, migrations, and deployment schedule files unchanged.

### Task 1: Insert-Only Store Synchronization Module

**Files:**
- Create: `lib/jobs/sync-stores.ts`
- Create: `app/api/cron/sync-stores/route.spec.ts`

**Interfaces:**
- Produces: `parseStoreSheetRows(rows: readonly (readonly SheetCell[])[]): SheetStore[]`
- Produces: `filterNewStores(stores: readonly SheetStore[], existingCodes: ReadonlySet<string>): SheetStore[]`
- Produces: `syncStoresFromSheet(): Promise<SyncStoresResult>`
- `SheetStore` is `{ code: string; name: string; branch: string }`.
- `SyncStoresResult` is `{ rows: number; created: number; skipped: number }`.

- [ ] **Step 1: Write the failing parser and filter self-check**

Create `app/api/cron/sync-stores/route.spec.ts`:

```ts
import assert from "node:assert/strict"

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

console.log("store sync self-check passed")
```

- [ ] **Step 2: Run the self-check and confirm the RED state**

Run:

```bash
npx tsx app/api/cron/sync-stores/route.spec.ts
```

Expected: non-zero exit with a module-not-found error for `@/lib/jobs/sync-stores`.

- [ ] **Step 3: Implement the minimum synchronization module**

Create `lib/jobs/sync-stores.ts`:

```ts
type SheetCell = string | number | boolean | null | undefined

export type SheetStore = {
  code: string
  name: string
  branch: string
}

export type SyncStoresResult = {
  rows: number
  created: number
  skipped: number
}

const HEADER_ALIASES = {
  code: ["kode", "kode toko", "code", "store code"],
  name: ["nama", "nama toko", "name", "store name"],
  branch: ["cabang", "nama cabang", "branch", "branch name"],
} as const

function requiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} env variable is not set`)
  return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function normalizeHeader(value: SheetCell) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
}

function findHeaderIndex(
  header: readonly SheetCell[],
  aliases: readonly string[]
) {
  return header.findIndex((cell) => aliases.includes(normalizeHeader(cell)))
}

export function parseStoreSheetRows(
  rows: readonly (readonly SheetCell[])[]
): SheetStore[] {
  const header = rows[0]
  if (!header) throw new Error("Spreadsheet tidak memiliki header")

  const codeIndex = findHeaderIndex(header, HEADER_ALIASES.code)
  const nameIndex = findHeaderIndex(header, HEADER_ALIASES.name)
  const branchIndex = findHeaderIndex(header, HEADER_ALIASES.branch)

  if ([codeIndex, nameIndex, branchIndex].includes(-1)) {
    throw new Error('Header wajib: "Kode Toko", "Nama Toko", dan "Cabang"')
  }

  const stores = new Map<string, SheetStore>()

  for (const [index, row] of rows.slice(1).entries()) {
    const code = String(row[codeIndex] ?? "").trim().toUpperCase()
    const name = String(row[nameIndex] ?? "").trim()
    const branch = String(row[branchIndex] ?? "").trim()

    if (row.every((cell) => !String(cell ?? "").trim())) continue
    if (!code || !name || !branch) {
      throw new Error(`Baris ${index + 2} tidak lengkap`)
    }

    const duplicate = stores.get(code)
    if (
      duplicate &&
      (duplicate.name !== name || duplicate.branch !== branch)
    ) {
      throw new Error(`Kode toko duplikat ${code} memiliki data berbeda`)
    }

    stores.set(code, { code, name, branch })
  }

  return [...stores.values()]
}

export function filterNewStores(
  stores: readonly SheetStore[],
  existingCodes: ReadonlySet<string>
) {
  return stores.filter((store) => !existingCodes.has(store.code))
}

async function fetchAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      refresh_token: requiredEnv("GOOGLE_REFRESH_TOKEN"),
      grant_type: "refresh_token",
    }),
  })

  if (!response.ok) {
    throw new Error(`Google OAuth request failed (${response.status})`)
  }

  const payload: unknown = await response.json()
  if (
    !isRecord(payload) ||
    typeof payload.access_token !== "string" ||
    !payload.access_token
  ) {
    throw new Error("Google OAuth response did not include an access token")
  }

  return payload.access_token
}

async function fetchStoreSheet(): Promise<SheetCell[][]> {
  const spreadsheetId = requiredEnv("GOOGLE_STORE_SPREADSHEET_ID")
  const range = requiredEnv("GOOGLE_STORE_SHEET_RANGE")
  const accessToken = await fetchAccessToken()
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/` +
    `${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Google Sheets request failed (${response.status})`)
  }

  const payload: unknown = await response.json()
  if (!isRecord(payload) || payload.values === undefined) return []
  if (
    !Array.isArray(payload.values) ||
    payload.values.some((row) => !Array.isArray(row))
  ) {
    throw new Error("Google Sheets response contained invalid rows")
  }

  return payload.values as SheetCell[][]
}

export async function syncStoresFromSheet(): Promise<SyncStoresResult> {
  const stores = parseStoreSheetRows(await fetchStoreSheet())
  const { prisma } = await import("@/lib/prisma")
  const existingStores = await prisma.store.findMany({
    select: { code: true },
  })
  const existingCodes = new Set(
    existingStores.map((store) => store.code.trim().toUpperCase())
  )
  const newStores = filterNewStores(stores, existingCodes)

  if (newStores.length === 0) {
    return { rows: stores.length, created: 0, skipped: stores.length }
  }

  const result = await prisma.store.createMany({
    data: newStores.map((store) => ({
      code: store.code,
      name: store.name,
      branch: store.branch,
      plnCustomerId: null,
      type: "",
      is24Hours: false,
      openTime: "08:00",
      closeTime: "22:00",
      plnPowerVa: 0,
      parkingAreaM2: 0,
      terraceAreaM2: 0,
      salesAreaM2: 0,
      warehouseAreaM2: 0,
    })),
    skipDuplicates: true,
  })

  return {
    rows: stores.length,
    created: result.count,
    skipped: stores.length - result.count,
  }
}
```

The dynamic Prisma import is deliberate: the self-check can import parser helpers without requiring `DATABASE_URL`, while production still loads the existing singleton before the first database query.

- [ ] **Step 4: Run the self-check and confirm the GREEN state**

Run:

```bash
npx tsx app/api/cron/sync-stores/route.spec.ts
```

Expected:

```text
store sync self-check passed
```

- [ ] **Step 5: Lint and type-check the first task**

Run:

```bash
npx eslint lib/jobs/sync-stores.ts app/api/cron/sync-stores/route.spec.ts
npm run typecheck
```

Expected: both commands exit `0`.

- [ ] **Step 6: Commit only the first task**

Run:

```bash
git add lib/jobs/sync-stores.ts app/api/cron/sync-stores/route.spec.ts
git diff --cached --check
git commit -m "feat: add insert-only store sync"
```

Expected: the commit contains only the synchronization module and self-check.

### Task 2: Authenticated Cron Route and Exact Proxy Bypass

**Files:**
- Create: `app/api/cron/sync-stores/route.ts`
- Modify: `app/api/cron/sync-stores/route.spec.ts`
- Modify: `proxy.ts:23-26`

**Interfaces:**
- Consumes: `syncStoresFromSheet(): Promise<SyncStoresResult>` from Task 1.
- Produces: `POST(request: NextRequest)` for `POST /api/cron/sync-stores`.
- Success response: `{ ok: true, rows: number, created: number, skipped: number }`.
- Error responses: `500 { error: "Server misconfigured" }`, `401 { error: "Unauthorized" }`, or `500 { error: "Store sync failed" }`.

- [ ] **Step 1: Extend the self-check with failing route-auth assertions**

Replace `app/api/cron/sync-stores/route.spec.ts` with:

```ts
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
```

- [ ] **Step 2: Run the self-check and confirm the RED state**

Run:

```bash
npx tsx app/api/cron/sync-stores/route.spec.ts
```

Expected: non-zero exit with a module-not-found error for `@/app/api/cron/sync-stores/route`.

- [ ] **Step 3: Implement the route**

Create `app/api/cron/sync-stores/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server"

import { syncStoresFromSheet } from "@/lib/jobs/sync-stores"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()

  if (!secret) {
    console.error("CRON_SECRET is not configured")
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    )
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await syncStoresFromSheet()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("Store sync cron job failed", error)
    return NextResponse.json({ error: "Store sync failed" }, { status: 500 })
  }
}
```

- [ ] **Step 4: Exempt only the exact cron path from Better Auth**

In `proxy.ts`, replace lines 23-26 with:

```ts
  // The cron route authenticates itself with CRON_SECRET.
  if (
    pathname === "/api/cron/sync-stores" ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next()
  }
```

Do not add `/api/cron` to `publicPrefixes`; that would silently exempt future cron routes.

- [ ] **Step 5: Run the self-check and confirm the GREEN state**

Run:

```bash
npx tsx app/api/cron/sync-stores/route.spec.ts
```

Expected: exit `0` and output ending with:

```text
store sync self-check passed
```

The intentional missing-secret case may also emit `CRON_SECRET is not configured` on stderr.

- [ ] **Step 6: Run focused and repository verification**

Run:

```bash
npx eslint lib/jobs/sync-stores.ts app/api/cron/sync-stores/route.ts app/api/cron/sync-stores/route.spec.ts proxy.ts
npm run typecheck
npm run build
```

Expected:

- ESLint exits `0`.
- TypeScript exits `0`.
- The production build exits `0`.
- The build route list contains `/api/cron/sync-stores`.

- [ ] **Step 7: Review the final diff and commit only application files**

Run:

```bash
git diff --check
git status --short
git add lib/jobs/sync-stores.ts app/api/cron/sync-stores/route.ts app/api/cron/sync-stores/route.spec.ts proxy.ts
git diff --cached --check
git diff --cached --name-status
git commit -m "feat: add store sync cron endpoint"
```

Expected staged paths:

```text
M	app/api/cron/sync-stores/route.spec.ts
A	app/api/cron/sync-stores/route.ts
M	proxy.ts
```

`lib/jobs/sync-stores.ts` is already committed in Task 1, so staging it again adds nothing. The user-owned CSV deletions and `.claude/` must remain unstaged.

### Task 3: Dokploy Runtime Acceptance

**Files:**
- No repository files change.

**Interfaces:**
- Consumes: the deployed `POST /api/cron/sync-stores` endpoint.
- Consumes: `PORT`, `CRON_SECRET`, and the five Google environment variables.
- Produces: a successful Dokploy job log with `{ ok, rows, created, skipped }`.

- [ ] **Step 1: Confirm runtime variables exist in the Energy application**

Confirm Dokploy provides:

```text
CRON_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN
GOOGLE_STORE_SPREADSHEET_ID
GOOGLE_STORE_SHEET_RANGE
```

Use the same Google credentials, spreadsheet ID, and range as SPARTA Maintenance. Do not print secret values into logs.

- [ ] **Step 2: Configure the once-daily Dokploy Schedule Job**

Set the timing and timezone in Dokploy. Use this command inside the Energy application container:

```bash
node -e "(async()=>{const port=process.env.PORT||3000;const r=await fetch('http://127.0.0.1:'+port+'/api/cron/sync-stores',{method:'POST',headers:{authorization:'Bearer '+process.env.CRON_SECRET}});const body=await r.text();console.log(body);if(!r.ok)process.exit(1)})().catch(e=>{console.error(e);process.exit(1)})"
```

- [ ] **Step 3: Invoke the job manually once after deployment**

Expected: exit `0` and one JSON line shaped like:

```json
{"ok":true,"rows":100,"created":3,"skipped":97}
```

Counts depend on the current Sheet and database state.

- [ ] **Step 4: Invoke it again without changing the Sheet**

Expected: exit `0`, `created` is `0`, and `skipped` equals `rows`. Existing store records remain unchanged.
