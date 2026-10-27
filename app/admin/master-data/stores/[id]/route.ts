import { NextResponse } from "next/server"

import { requireUserManager } from "@/lib/admin-auth"
import {
  deleteMasterStore,
  updateMasterStore,
} from "@/lib/admin-master-data-mutations"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireUserManager()
  const { id } = await params

  try {
    const body = await request.json()
    const result = await updateMasterStore(id, body)
    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status }
      )
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireUserManager()
  const { id } = await params

  const result = await deleteMasterStore(id)
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: result.status }
    )
  }

  return NextResponse.json({ ok: true })
}
