import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    if (!slug || slug.length < 3) {
      return new NextResponse("Invalid tile parameters", { status: 400 })
    }

    const [z, x, rawY] = slug
    const y = rawY.replace(/\.mvt$/, "")

    const apiKey = process.env.PROTOMAPS_API_KEY || "f6cac8c113d13705"
    const upstreamUrl = `https://api.protomaps.com/tiles/v4/${z}/${x}/${y}.mvt?key=${apiKey}`

    const res = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/x-protobuf, application/vnd.mapbox-vector-tile, */*",
      },
      next: {
        revalidate: 60 * 60 * 24 * 7, // Cache server-side for 7 days
      },
      signal: AbortSignal.timeout(15000), // 15s timeout
    })

    if (!res.ok) {
      return new NextResponse(`Upstream tile error: ${res.statusText}`, {
        status: res.status,
      })
    }

    const buffer = await res.arrayBuffer()
    const contentType =
      res.headers.get("content-type") || "application/x-protobuf"

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("[Map-Tiles Proxy Error]:", error)
    return new NextResponse("Failed to fetch map tile", { status: 500 })
  }
}
