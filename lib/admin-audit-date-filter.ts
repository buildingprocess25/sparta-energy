import type { Prisma } from "@prisma/client"

type AuditDateRange = {
  gte: Date
  lt: Date
}

function getMonthDateRange(year: number, month: number): AuditDateRange {
  return {
    gte: new Date(year, month - 1, 1, 0, 0, 0, 0),
    lt: new Date(year, month, 1, 0, 0, 0, 0),
  }
}

function getYearDateRange(year: number): AuditDateRange {
  return {
    gte: new Date(year, 0, 1, 0, 0, 0, 0),
    lt: new Date(year + 1, 0, 1, 0, 0, 0, 0),
  }
}

function parseYear(value: string) {
  const parsedYear = Number(value)
  return Number.isInteger(parsedYear) ? parsedYear : null
}

function parseMonth(value: string) {
  const parsedMonth = Number(value)
  if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    return null
  }

  return parsedMonth
}

export function getAdminAuditDateWhere(
  year: string,
  month: string
): Prisma.AuditWhereInput | null {
  if (year !== "all") {
    const parsedYear = parseYear(year)
    if (parsedYear === null) return null

    if (month !== "all") {
      const parsedMonth = parseMonth(month)
      if (parsedMonth === null) return null

      return {
        auditDate: getMonthDateRange(parsedYear, parsedMonth),
      }
    }

    return {
      auditDate: getYearDateRange(parsedYear),
    }
  }

  return null
}
