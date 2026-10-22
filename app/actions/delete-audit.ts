"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type ActionResult = {
  success: boolean
  message: string
}

export async function deleteAudit(auditId: string): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return {
        success: false,
        message: "Sesi Anda telah berakhir. Silakan login kembali.",
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })
    if (user?.role !== "ADMIN") {
      return { success: false, message: "Hanya admin yang bisa menghapus audit." }
    }

    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      select: { store: { select: { name: true } } },
    })
    if (!audit) {
      return { success: false, message: "Audit tidak ditemukan." }
    }

    // audit_items has no cascade on the audit relation; PLN history and
    // recommendations cascade on their own.
    await prisma.$transaction([
      prisma.auditItem.deleteMany({ where: { auditId } }),
      prisma.audit.delete({ where: { id: auditId } }),
    ])

    revalidatePath("/dashboard")
    revalidatePath("/history")
    revalidatePath("/audit/validation")

    return {
      success: true,
      message: `Audit ${audit.store.name} sudah dihapus.`,
    }
  } catch (error) {
    console.error("[Delete Audit] Failed to delete audit:", error)
    return { success: false, message: "Gagal menghapus audit. Coba lagi." }
  }
}
