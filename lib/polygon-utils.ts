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
