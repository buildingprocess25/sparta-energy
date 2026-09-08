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

    const { email, fullName, role, branch } = input

    if (!email) {
      return {
        success: false,
        message: "Email wajib diisi",
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
    const dummyPassword = crypto.randomBytes(16).toString("hex")

    // Execute in a transaction to create both User and Account
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashPassword(dummyPassword),
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
          password: hashPassword(dummyPassword),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    })

    // S2S SYNC to login-sparta
    try {
      const apiUrl = process.env.SPARTA_API_URL || "http://localhost:10000"
      const apiKey = process.env.SPARTA_INTERNAL_API_KEY || "sparta-internal-sync-key-2026"
      await fetch(`${apiUrl}/v1/admin/users/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sparta-internal-key": apiKey
        },
        body: JSON.stringify({
          email: normalizedEmail,
          fullName: trimmedFullName || normalizedEmail,
          branchCode: normalizedBranch || "HEAD",
          branchName: normalizedBranch || "HEAD",
          role,
          moduleId: "energy"
        })
      })
    } catch (e) {
      console.error("[S2S SYNC] Failed to sync energy user to SSO", e)
    }

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
