"use server"

import { revalidatePath } from "next/cache"
import * as crypto from "crypto"
import { isRedirectError } from "next/dist/client/components/redirect-error"

import { requireUserManager } from "@/lib/admin-auth"
import { hashUserPassword, legacySha256 } from "@/lib/password"
import { prisma } from "@/lib/prisma"
import { isRole, usesBranch } from "@/lib/role-access"
import type { Role } from "@prisma/client"

type ActionResult = {
  success: boolean
  message: string
}

type CreateUserInput = {
  email: string
  fullName: string | null
  role: Role
  branch: string | null
}


export async function createUser(
  input: CreateUserInput
): Promise<ActionResult> {
  try {
    await requireUserManager()

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

    if (!isRole(role)) {
      return {
        success: false,
        message: "Role tidak valid.",
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
    const normalizedBranch = usesBranch(role) ? branch?.trim() || null : null
    const dummyPassword = crypto.randomBytes(16).toString("hex")
    // users.password_hash stays SHA-256 until the other repos are checked; sign-in reads account.password.
    const legacyHash = legacySha256(dummyPassword)
    const accountHash = await hashUserPassword(dummyPassword)

    // Execute in a transaction to create both User and Account
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: legacyHash,
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
          password: accountHash,
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
