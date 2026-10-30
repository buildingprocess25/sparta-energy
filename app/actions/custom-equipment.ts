"use server"

import { revalidatePath } from "next/cache"

import { requireUserManager } from "@/lib/admin-auth"
import {
  approveCustomEquipment,
  CustomEquipmentReviewError,
  rejectCustomEquipment,
  type ApproveCustomEquipmentInput,
} from "@/lib/custom-equipment-review"

type ActionResult = { success: boolean; message: string }

async function run(
  failMessage: string,
  successMessage: string,
  action: (reviewerId: string) => Promise<unknown>
): Promise<ActionResult> {
  const reviewer = await requireUserManager()
  try {
    await action(reviewer.id)
    revalidatePath("/admin/master-data")
    return { success: true, message: successMessage }
  } catch (error) {
    if (error instanceof CustomEquipmentReviewError) {
      return { success: false, message: error.message }
    }
    console.error(`[Custom Equipment] ${failMessage}`, error)
    return { success: false, message: failMessage }
  }
}

export async function approveCustomEquipmentAction(input: ApproveCustomEquipmentInput) {
  return run(
    "Gagal menyimpan ke master. Coba lagi.",
    `"${input.name.trim()}" masuk master equipment.`,
    (reviewerId) => approveCustomEquipment(input, reviewerId)
  )
}

export async function rejectCustomEquipmentAction(id: string) {
  return run(
    "Gagal menolak usulan. Coba lagi.",
    "Usulan ditolak dan keluar dari antrean.",
    (reviewerId) => rejectCustomEquipment(id, reviewerId)
  )
}
