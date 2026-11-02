// Decimal places follow the audit sheet: kW and COP at two, temperatures and ventilation at one.
export const twoDecimals = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
export const oneDecimal = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
export const wholeNumber = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
})

export function formatValue(
  value: number | null,
  suffix: string,
  formatter: Intl.NumberFormat
) {
  return value === null ? "-" : `${formatter.format(value)} ${suffix}`
}
