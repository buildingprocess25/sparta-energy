import { NextResponse } from "next/server"

import { requireUserManager } from "@/lib/admin-auth"
import { createMasterEquipment } from "@/lib/admin-master-data-mutations"

export async function POST(request: Request) {
  const user = await requireUserManager()

  try {
    const body = (await request.json()) as Record<string, unknown>
    const result = await createMasterEquipment({
      ...body,
      createdById: user.id,
    })
    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status }
      )
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 }
    )
  }
}
