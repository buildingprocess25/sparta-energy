import fs from "fs"
import path from "path"
import { parseDxfStoreLayout } from "../lib/cad/dxf-parser"

function test() {
  const filePath = path.join(process.cwd(), "example_dwg_dxf", "Layout Kalkulator Standar A.Sales.dxf")
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath)
    return
  }

  const content = fs.readFileSync(filePath, "utf-8")
  const result = parseDxfStoreLayout(content, "Layout Kalkulator Standar A.Sales.dxf")

  console.log("=== DXF PARSE RESULT ===")
  console.log("Dimensions:", result.dimensions)
  console.log("Metrics:", result.metrics)
  console.log("Polygon Points:", result.polygon)
  console.log("Overrides:", result.segmentOverrides)
  console.log("Doors:", result.doors)
  console.log("Zones:", result.zones)
  console.log("Raw Summary:", result.rawSummary)
}

test()
