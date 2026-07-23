# Store Sync Cron Endpoint

Date: 2026-07-23
Status: Approved for implementation

## Summary

Add a private `POST /api/cron/sync-stores` endpoint for a Dokploy Schedule Job. The endpoint reads the same Google Sheet used by SPARTA Maintenance and inserts only stores whose codes do not already exist in SPARTA Energy.

The application owns the endpoint and synchronization logic. Dokploy owns the schedule, timezone, and command execution.

## Goals

- Synchronize new stores from the existing private Google Sheet.
- Keep synchronization idempotent and insert-only.
- Authenticate the schedule request with `CRON_SECRET`.
- Run correctly in the existing Next.js standalone Docker image.
- Return counts that are useful in Dokploy job logs.

## Non-Goals

- Updating existing store names, branches, or other fields.
- Deleting or disabling stores missing from the Sheet.
- Adding schedule or timezone configuration to the repository.
- Adding a second store-sync CLI wrapper.
- Changing the Prisma schema or creating a migration.
- Exposing PostgreSQL publicly.

## Reference

SPARTA Maintenance already uses:

- `lib/jobs/sync-stores.ts` for reusable synchronization logic.
- `POST /api/cron/sync-stores` as the standalone-compatible entry point.
- `Authorization: Bearer <CRON_SECRET>`.
- Header validation, duplicate detection, and insert-only `createMany`.

SPARTA Energy will preserve that contract while adapting the inserted fields to its stricter `Store` model.

## Architecture

### `lib/jobs/sync-stores.ts`

This module owns:

- Google OAuth token refresh using native `fetch` and `URLSearchParams`.
- Google Sheets Values API retrieval using native `fetch`.
- Sheet parsing and validation.
- Existing-code filtering.
- Prisma bulk insertion.

No `googleapis` dependency is added.

### `app/api/cron/sync-stores/route.ts`

The route:

1. Rejects missing server configuration.
2. Validates `Authorization: Bearer <CRON_SECRET>`.
3. Calls `syncStoresFromSheet()`.
4. Returns a JSON summary or a generic error response.

The default Node.js runtime is sufficient; no Edge runtime is used.

### `proxy.ts`

The current proxy requires a Better Auth session for paths outside its public list. It will allow only `/api/cron/sync-stores` to reach the route without a user session.

This is not public access to the operation: the route still requires the cron Bearer secret. The broader `/api/cron` prefix will not be exempted.

## Google Sheet Contract

The first row must contain aliases for:

- Store code: `kode`, `kode toko`, `code`, or `store code`
- Store name: `nama`, `nama toko`, `name`, or `store name`
- Branch: `cabang`, `nama cabang`, `branch`, or `branch name`

Parsing rules:

- Normalize headers to lowercase and collapse separators/whitespace.
- Trim every value.
- Normalize store codes to uppercase.
- Ignore completely blank rows.
- Reject incomplete rows.
- Deduplicate identical rows by normalized store code.
- Reject duplicate codes that contain different name or branch values.

Any invalid row fails the whole job before database writes.

## Insert-Only Mapping

Only codes not already present in `stores.code` are inserted. Existing codes are compared case-insensitively by normalizing database values to uppercase.

New stores use the existing defaults from `scripts/import-stores.ts`:

| Energy field | Value |
| --- | --- |
| `code` | Normalized Sheet code |
| `name` | Sheet name |
| `branch` | Sheet branch |
| `plnCustomerId` | `null` |
| `type` | `""` |
| `is24Hours` | `false` |
| `openTime` | `"08:00"` |
| `closeTime` | `"22:00"` |
| `plnPowerVa` | `0` |
| `parkingAreaM2` | `0` |
| `terraceAreaM2` | `0` |
| `salesAreaM2` | `0` |
| `warehouseAreaM2` | `0` |

Insertion uses `createMany({ skipDuplicates: true })`. The unique store-code constraint plus `skipDuplicates` also keeps overlapping job executions safe without adding a lock.

## API Contract

### Request

```http
POST /api/cron/sync-stores
Authorization: Bearer <CRON_SECRET>
```

The request has no body.

### Success

Status `200`:

```json
{
  "ok": true,
  "rows": 100,
  "created": 3,
  "skipped": 97
}
```

### Errors

- Missing `CRON_SECRET`: `500 { "error": "Server misconfigured" }`
- Missing or incorrect Bearer token: `401 { "error": "Unauthorized" }`
- Google OAuth, Google Sheets, validation, or database failure: `500 { "error": "Store sync failed" }`

Detailed failures are logged server-side. Responses do not expose credentials, upstream bodies, or database details.

## Environment Variables

Dokploy must provide these runtime variables:

- `CRON_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_STORE_SPREADSHEET_ID`
- `GOOGLE_STORE_SHEET_RANGE`

They use the same Google Sheet credentials and identifiers as SPARTA Maintenance.

## Dokploy Invocation

Dokploy runs the schedule once per day. The exact time, timezone, and cron expression remain Dokploy configuration.

The command follows the working Maintenance pattern and calls the Energy app through its loopback listener:

```bash
node -e "(async()=>{const port=process.env.PORT||3000;const r=await fetch('http://127.0.0.1:'+port+'/api/cron/sync-stores',{method:'POST',headers:{authorization:'Bearer '+process.env.CRON_SECRET}});const body=await r.text();console.log(body);if(!r.ok)process.exit(1)})().catch(e=>{console.error(e);process.exit(1)})"
```

The Schedule Job must execute in the Energy application container or another execution context where that loopback listener and the same environment variables are available.

## Testing

One small `tsx` self-check will cover:

- Header aliases and reordered columns.
- Uppercase code normalization.
- Blank-row handling.
- Incomplete-row rejection.
- Conflicting duplicate rejection.
- Filtering existing codes.
- Route response when `CRON_SECRET` is missing.
- Route response for a missing or incorrect Bearer token.

Verification before delivery:

1. Run the sync self-check with `tsx`.
2. Run `npm run typecheck`.
3. Run ESLint on the changed TypeScript files.
4. Run `npm run build` and confirm the cron route is included.
5. After deployment, invoke the Dokploy command manually once and confirm the JSON result and inserted count.

No live Google or production database call is performed by the automated self-check.

## Planned Files

- `lib/jobs/sync-stores.ts` — new synchronization module.
- `app/api/cron/sync-stores/route.ts` — new authenticated route.
- `app/api/cron/sync-stores/route.spec.ts` — one parser/filter/auth self-check.
- `proxy.ts` — exact cron-route session bypass.

## Open Questions

None.
