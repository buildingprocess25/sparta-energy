// ID PLN is the PLN customer number. Its format is not locked; auditors copy it from PLN Mobile or the meter.
export const PLN_CUSTOMER_ID_MAX_LENGTH = 50

export function plnCustomerIdHint(value: string) {
  return value.trim()
    ? "Cocokkan dengan PLN Mobile atau meteran listrik toko. Kalau beda, perbaiki di sini."
    : "Belum ada di data toko. Cek di aplikasi PLN Mobile atau di meteran listrik toko, lalu ketik di sini."
}
