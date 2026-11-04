"use server"

import { revalidatePath } from "next/cache"

import { requireUserManager } from "@/lib/admin-auth"
import {
  addFieldBrandToMaster,
  dismissFieldBrand,
  type AddFieldBrandInput,
} from "@/lib/unregistered-brands-review"
import { UnregisteredBrandError } from "@/lib/unregistered-brands"

type ActionResult = { success: boolean; message: string }

async function run(
  failMessage: string,
  action: (reviewerId: string) => Promise<string>
): Promise<ActionResult> {
  const reviewer = await requireUserManager()
  try {
    const message = await action(reviewer.id)
    revalidatePath("/admin/master-data")
    return { success: true, message }
  } catch (error) {
    if (error instanceof UnregisteredBrandError) {
      return { success: false, message: error.message }
    }
    console.error(`[Field Brands] ${failMessage}`, error)
    return { success: false, message: failMessage }
  }
}

export async function addFieldBrandToMasterAction(input: AddFieldBrandInput) {
  return run("Gagal menyimpan merek ke master. Coba lagi.", async (reviewerId) => {
    const { brandName, typeName } = await addFieldBrandToMaster(input, reviewerId)
    return `"${brandName}" masuk master di tipe ${typeName}.`
  })
}

export async function dismissFieldBrandAction(input: {
  equipmentTypeId: string
  fieldBrandName: string
}) {
  return run("Gagal mengabaikan merek. Coba lagi.", async (reviewerId) => {
    await dismissFieldBrand(input, reviewerId)
    return `"${input.fieldBrandName.trim()}" disembunyikan dari daftar.`
  })
}
