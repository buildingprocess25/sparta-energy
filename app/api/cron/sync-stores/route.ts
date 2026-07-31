import { syncStoresFromSheet } from "@/lib/jobs/sync-stores"

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET?.trim()

  if (!secret) {
    console.error("CRON_SECRET is not configured")
    return Response.json({ error: "Server misconfigured" }, { status: 500 })
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await syncStoresFromSheet()
    console.log("[sync-stores] Sync completed successfully:", result)
    return Response.json({ ok: true, ...result })
  } catch (error) {
    console.error("[sync-stores] Store sync cron job failed:", error)
    return Response.json(
      { error: "Store sync failed", details: String(error) },
      { status: 500 }
    )
  }
}
