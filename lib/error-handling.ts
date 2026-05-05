export type ActionErrorType =
  | "network"
  | "server"
  | "validation"
  | "auth"
  | "forbidden"
  | "not-found"
  | "unknown"

export type ActionError = {
  type: ActionErrorType
  message: string
}

const timeoutPattern =
  /(timeout|timed out|ETIMEDOUT|ECONNREFUSED|P1001|P1002|P1003|P1008|P1017)/i

export function getServerErrorMessage(error: unknown) {
  if (error instanceof Error && timeoutPattern.test(error.message)) {
    return "Gagal memproses data. Koneksi ke sistem terputus (Timeout). Silakan coba lagi."
  }

  return "Gagal memproses data. Server sedang sibuk. Silakan coba lagi."
}
