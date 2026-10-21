import { prisma } from "../lib/prisma"

async function main() {
  const logs = await (prisma as any).mepSimulationLog.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
  })
  console.log("LOGS_COUNT:", logs.length)
  for (const log of logs) {
    console.log("ID:", log.id)
    console.log("StoreName:", log.storeName)
    console.log("PlacedUnitsCount:", log.layoutData?.placedUnits?.length)
    console.log("CustomPtsCount:", log.layoutData?.customPts?.length)
    console.log("LayoutData keys:", Object.keys(log.layoutData || {}))
  }
}

main().catch(console.error).finally(() => process.exit(0))
