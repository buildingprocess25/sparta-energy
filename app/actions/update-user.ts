"use server"

import { revalidatePath } from "next/cache"
import { isRedirectError } from "next/dist/client/components/redirect-error"

import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

type ActionResult = {
  success: boolean
  message: string
}

type UpdateUserInput = {
  userId: string
  email?: string
  fullName?: string | null
  role?: "USER" | "ADMIN"
  branch?: string | null
}

export async function updateUser(
  input: UpdateUserInput
): Promise<ActionResult> {
  try {
    await requireAdmin()

    const { userId, email, fullName, role, branch } = input

    if (!userId) {
      return {
        success: false,
        message: "User ID harus diisi",
      }
    }

    // Validate at least one field provided
    if (
      email === undefined &&
      fullName === undefined &&
      role === undefined &&
      branch === undefined
    ) {
      return {
        success: false,
        message: "Minimal satu field harus diisi untuk diupdate",
      }
    }

    // Validate email format if provided
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return {
          success: false,
          message: "Format email tidak valid",
        }
      }
    }

    // Validate role enum if provided
    if (role !== undefined && role !== "USER" && role !== "ADMIN") {
      return {
        success: false,
        message: "Role tidak valid. Harus USER atau ADMIN",
      }
    }

    // Fetch current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        branch: true,
      },
    })

    if (!currentUser) {
      return {
        success: false,
        message: "User tidak ditemukan",
      }
    }

    // Build update data object with only changed fields
    const updateData: {
      email?: string
      fullName?: string | null
      role?: "USER" | "ADMIN"
      branch?: string | null
    } = {}

    const changes: string[] = []

    // Check and add email if changed
    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase()
      if (normalizedEmail !== currentUser.email.toLowerCase()) {
        updateData.email = normalizedEmail
        changes.push("email")
      }
    }

    // Check and add fullName if changed
    if (fullName !== undefined) {
      const trimmedFullName = (fullName || "").trim() || null
      if (trimmedFullName !== currentUser.fullName) {
        updateData.fullName = trimmedFullName
        changes.push("nama")
      }
    }

    // Check and add role if changed
    if (role !== undefined && role !== currentUser.role) {
      updateData.role = role
      changes.push("role")
    }

    // Check and add branch if changed
    if (branch !== undefined) {
      const normalizedBranch = (branch || "").trim() || null
      if (normalizedBranch !== currentUser.branch) {
        updateData.branch = normalizedBranch
        changes.push("cabang")
      }
    }

    // Check if there are actual changes
    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: "Tidak ada perubahan yang dilakukan",
      }
    }

    // Execute update
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    revalidatePath("/admin/users")

    return {
      success: true,
      message: `Data user berhasil diperbarui (${changes.join(", ")})`,
    }
  } catch (error) {
    if (isRedirectError(error)) throw error
    // Handle Prisma unique constraint violation (P2002)
    if (error instanceof Error && "code" in error) {
      const prismaError = error as { code: string }
      if (prismaError.code === "P2002") {
        return {
          success: false,
          message: "Email sudah digunakan oleh user lain",
        }
      }
    }

    console.error("Failed to update user:", error)
    return {
      success: false,
      message: "Gagal mengubah data user. Silakan coba lagi.",
    }
  }
}
