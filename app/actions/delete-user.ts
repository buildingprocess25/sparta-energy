"use server"

import { revalidatePath } from "next/cache"
import { isRedirectError } from "next/dist/client/components/redirect-error"

import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

type ActionResult = {
  success: boolean
  message: string
}

type DeleteUserInput = {
  userId: string
}

export async function deleteUser(
  input: DeleteUserInput
): Promise<ActionResult> {
  try {
    const currentAdmin = await requireAdmin()
    const { userId } = input

    if (!userId) {
      return {
        success: false,
        message: "User ID harus diisi",
      }
    }

    // 1. Prevent self-deletion
    if (currentAdmin.id === userId) {
      return {
        success: false,
        message: "Anda tidak dapat menghapus akun Anda sendiri",
      }
    }

    // Fetch user to verify they exist
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    })

    if (!userToDelete) {
      return {
        success: false,
        message: "User tidak ditemukan",
      }
    }

    // 2. Prevent deletion of users with active audit records
    const auditCount = await prisma.audit.count({
      where: { auditorId: userId },
    })

    if (auditCount > 0) {
      return {
        success: false,
        message: "Tidak dapat menghapus user karena memiliki data audit. Silakan ubah data akses atau nonaktifkan user sebagai gantinya.",
      }
    }

    // 3. Execute deletion in transaction (Accounts then User)
    await prisma.$transaction(async (tx) => {
      // Delete associated session records
      await tx.session.deleteMany({
        where: { userId },
      })

      // Delete associated account records
      await tx.account.deleteMany({
        where: { userId },
      })

      // Delete user record
      await tx.user.delete({
        where: { id: userId },
      })
    })

    revalidatePath("/admin/users")

    const nameDisplay = userToDelete.fullName || userToDelete.email
    return {
      success: true,
      message: `User ${nameDisplay} berhasil dihapus dari sistem`,
    }
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error("Failed to delete user:", error)
    return {
      success: false,
      message: "Gagal menghapus user. Silakan coba lagi.",
    }
  }
}
