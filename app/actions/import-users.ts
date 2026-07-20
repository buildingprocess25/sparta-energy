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

type ImportUserInput = {
  email: string
  fullName: string
  branch: string | null
  password: string
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

/**
 * Checks which emails from a given list are already registered in the database.
 */
export async function checkExistingEmails(
  emails: string[]
): Promise<string[]> {
  try {
    await requireAdmin()

    if (!emails || emails.length === 0) return []

    // Normalize and filter unique input emails
    const uniqueNormalizedEmails = Array.from(
      new Set(emails.map((e) => e.trim().toLowerCase()))
    )

    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: uniqueNormalizedEmails,
        },
      },
      select: {
        email: true,
      },
    })

    return existingUsers.map((u) => u.email.toLowerCase())
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error("Failed to check existing emails:", error)
    return []
  }
}

/**
 * Bulk imports users into the database, skipping duplicates.
 */
export async function importUsersBulk(
  users: ImportUserInput[]
): Promise<ActionResult> {
  try {
    await requireAdmin()

    if (!users || users.length === 0) {
      return {
        success: false,
        message: "Tidak ada data user yang dikirim untuk di-import.",
      }
    }

    // Step 1: Filter out duplicates from input list based on email
    const uniqueInputMap = new Map<string, ImportUserInput>()
    for (const u of users) {
      const emailNorm = u.email.trim().toLowerCase()
      if (!uniqueInputMap.has(emailNorm)) {
        uniqueInputMap.set(emailNorm, u)
      }
    }

    const uniqueInputUsers = Array.from(uniqueInputMap.values())
    const inputEmails = uniqueInputUsers.map((u) => u.email.trim().toLowerCase())

    // Step 2: Fetch already existing emails in the DB
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: inputEmails,
        },
      },
      select: {
        email: true,
      },
    })

    const existingEmailsSet = new Set(
      existingUsers.map((u) => u.email.toLowerCase())
    )

    // Step 3: Filter list to only contain NEW users
    const newUsersToInsert = uniqueInputUsers.filter(
      (u) => !existingEmailsSet.has(u.email.trim().toLowerCase())
    )

    if (newUsersToInsert.length === 0) {
      return {
        success: true,
        message: "Semua user dalam daftar sudah terdaftar di database. Tidak ada data baru yang di-import.",
      }
    }

    // Step 4: Perform bulk insertion in a transaction
    await prisma.$transaction(async (tx) => {
      for (const u of newUsersToInsert) {
        const emailNorm = u.email.trim().toLowerCase()
        const hashed = hashPassword(u.password)

        // Create User
        const newUser = await tx.user.create({
          data: {
            email: emailNorm,
            passwordHash: hashed,
            role: "USER",
            fullName: u.fullName.trim().toUpperCase(),
            branch: u.branch ? u.branch.trim() : null,
            emailVerified: true,
          },
        })

        // Create Account for better-auth credentials
        await tx.account.create({
          data: {
            id: `credential-${newUser.id}`,
            accountId: newUser.id,
            providerId: "credential",
            userId: newUser.id,
            password: hashed,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      }
    })

    revalidatePath("/admin/users")

    return {
      success: true,
      message: `${newUsersToInsert.length} user berhasil di-import ke database secara massal.`,
    }
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error("Failed to import users bulk:", error)
    return {
      success: false,
      message: "Gagal meng-import user massal. Silakan coba lagi.",
    }
  }
}
