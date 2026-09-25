import fs from "fs"
import path from "path"
import { parseDxfStoreLayout } from "../lib/cad/dxf-parser"

function testFile(filename: string) {
  const filePath = path.join(process.cwd(), "example_dwg_dxf", filename)
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath)
    return
  }

  const content = fs.readFileSync(filePath, "utf-8")
  const result = parseDxfStoreLayout(content, filename)

  console.log(`\n=================== RESULT FOR ${filename} ===================`)
  console.log("Dimensions:", result.dimensions)
  console.log("Metrics:", result.metrics)
  console.log("Polygon Point count:", result.polygon.length)
  console.log("Wall Segments count:", result.wallSegments.length)
  console.log("Overrides:", result.segmentOverrides)
  console.log("Doors:", result.doors)
  console.log("Zones (Cashier):", result.zones.cashier?.areaM2, "m2")
  console.log("Zones (Chiller):", result.zones.chiller?.areaM2, "m2, units:", result.zones.chiller?.unitCount)
  console.log("Zones (Glass):", result.zones.glass?.areaM2, "m2")
  console.log("Zones (Columns):", result.zones.columns)
  console.log("Raw Summary:", result.rawSummary)
}

function test() {
  testFile("Layout Kalkulator Standar A.Sales.dxf")
  testFile("Layout Kalkulator Standar A Sales V2 revisi arsir.dxf")
}

test()
