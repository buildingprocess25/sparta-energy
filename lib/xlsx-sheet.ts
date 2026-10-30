import * as XLSX from "xlsx"

// Shared by every audit export: one sheet is a name plus rows of cells.
export type Cell = string | number | Date | null
export type SheetData = { name: string; rows: Cell[][] }

function fitColumns(rows: Cell[][]) {
  const widths: number[] = []
  for (const row of rows.slice(0, 300)) {
    row.forEach((cell, index) => {
      const length =
        cell instanceof Date ? 12 : cell === null ? 0 : String(cell).length
      widths[index] = Math.max(widths[index] ?? 10, Math.min(length + 2, 60))
    })
  }
  return widths.map((wch) => ({ wch }))
}

export function appendSheet(
  workbook: XLSX.WorkBook,
  name: string,
  rows: Cell[][]
) {
  const sheet = XLSX.utils.aoa_to_sheet(rows, { cellDates: true })
  sheet["!cols"] = fitColumns(rows)
  rows.forEach((row, r) =>
    row.forEach((cell, c) => {
      const target = sheet[XLSX.utils.encode_cell({ r, c })]
      if (cell instanceof Date && target) target.z = "dd mmm yyyy"
    })
  )
  XLSX.utils.book_append_sheet(workbook, sheet, name)
}

export function toBuffer(workbook: XLSX.WorkBook) {
  return XLSX.write(workbook, {
    bookType: "xlsx",
    cellDates: true,
    type: "buffer",
  }) as Buffer
}

export function buildWorkbook(sheets: SheetData[]) {
  const workbook = XLSX.utils.book_new()
  for (const sheet of sheets) appendSheet(workbook, sheet.name, sheet.rows)
  return toBuffer(workbook)
}

export type SheetPreview = {
  name: string
  header: string[]
  rows: string[][]
  totalRows: number
}

const previewDate = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" })

// First rows of a recap sheet as text; recap sheets start with their header row.
export function toSheetPreview(sheet: SheetData, limit: number): SheetPreview {
  const text = (cell: Cell) =>
    cell === null
      ? ""
      : cell instanceof Date
        ? previewDate.format(cell)
        : String(cell)
  const [header = [], ...body] = sheet.rows
  return {
    name: sheet.name,
    header: header.map(text),
    rows: body.slice(0, limit).map((row) => row.map(text)),
    totalRows: body.length,
  }
}
