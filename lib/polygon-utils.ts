export interface Point {
  x: number
  y: number
}

export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) return false
  let inside = false
  const { x, y } = point
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y
    const xj = polygon[j].x,
      yj = polygon[j].y
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

export function calcPolygonArea(polygon: Point[]): number {
  if (polygon.length < 3) return 0
  let area = 0
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length
    area += polygon[i].x * polygon[j].y
    area -= polygon[j].x * polygon[i].y
  }
  return Math.abs(area) / 2
}

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

export function getBoundingBox(polygon: Point[]): BoundingBox {
  if (!polygon.length)
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
  const xs = polygon.map((p) => p.x)
  const ys = polygon.map((p) => p.y)
  const minX = Math.min(...xs),
    maxX = Math.max(...xs)
  const minY = Math.min(...ys),
    maxY = Math.max(...ys)
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}

export function distancePx(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

/**
 * Point in polygon test (Ray-casting algorithm)
 */
export function isPointInsidePolygon(pt: Point, poly: Point[]): boolean {
  if (poly.length < 3) return false
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    const intersect = yi > pt.y !== yj > pt.y && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/**
 * Returns unit inward normal vector for a wall segment (pointing into the polygon room)
 */
export function getWallInwardNormal(p1: Point, p2: Point, polygon: Point[]): { nx: number; ny: number } {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const len = Math.hypot(dx, dy)
  if (len < 0.001) return { nx: 0, ny: -1 }

  const ux = dx / len
  const uy = dy / len

  const n1 = { nx: -uy, ny: ux }
  const n2 = { nx: uy, ny: -ux }

  const midX = (p1.x + p2.x) / 2
  const midY = (p1.y + p2.y) / 2
  const eps = 0.05

  const test1: Point = { x: midX + eps * n1.nx, y: midY + eps * n1.ny }
  if (isPointInsidePolygon(test1, polygon)) {
    return n1
  }
  return n2
}

