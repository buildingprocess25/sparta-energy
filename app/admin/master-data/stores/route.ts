import { NextResponse } from "next/server"

import { requireUserManager } from "@/lib/admin-auth"
import { createMasterStore } from "@/lib/admin-master-data-mutations"

export async function POST(request: Request) {
  await requireUserManager()

  const result = await createMasterStore(await request.json())
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: result.status }
    )
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
