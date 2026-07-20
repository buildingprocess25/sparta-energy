"use server"

import { revalidatePath } from "next/cache"
import * as crypto from "crypto"
import { isRedirectError } from "next/dist/client/components/redirect-error"

import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

type ActionResult = {
  success: boolean
  message: string
}

type CreateUserInput = {
  email: string
  fullName: string | null
  password: string
  role: "USER" | "ADMIN"
  branch: string | null
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function createUser(
  input: CreateUserInput
): Promise<ActionResult> {
  try {
    await requireAdmin()

    const { email, fullName, password, role, branch } = input

    if (!email || !password) {
      return {
        success: false,
        message: "Email dan password wajib diisi",
      }
    }

    const normalizedEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return {
        success: false,
        message: "Format email tidak valid",
      }
    }



    if (role !== "USER" && role !== "ADMIN") {
      return {
        success: false,
        message: "Role tidak valid. Harus USER atau ADMIN",
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    if (existingUser) {
      return {
        success: false,
        message: "Email sudah digunakan oleh user lain",
      }
    }

    const trimmedFullName = fullName?.trim() || null
    const normalizedBranch = role === "ADMIN" ? null : branch?.trim() || null

    // Execute in a transaction to create both User and Account
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashPassword(password),
          role,
          fullName: trimmedFullName,
          branch: normalizedBranch,
          emailVerified: true,
        },
      })

      await tx.account.create({
        data: {
          id: `credential-${newUser.id}`,
          accountId: newUser.id,
          providerId: "credential",
          userId: newUser.id,
          password: hashPassword(password),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    })

    revalidatePath("/admin/users")

    return {
      success: true,
      message: `User ${trimmedFullName || normalizedEmail} berhasil ditambahkan`,
    }
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error("Failed to create user:", error)
    return {
      success: false,
      message: "Gagal menambahkan user. Silakan coba lagi.",
    }
  }
}
