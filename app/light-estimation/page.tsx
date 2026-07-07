import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { LightEstimationClient } from "./light-estimation-client"
import type { StoreData } from "@/app/audit/start/start-client"

const excludedBranchNames = [
  "DEMO",
  "Demo",
  "demo",
  "HEAD OFFICE",
  "Head Office",
  "head office",
]

export default async function LightEstimationPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login?reason=session-expired")

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { branch: true, role: true },
  })

  if (!dbUser) redirect("/forbidden")
  
  // Restricted to ADMIN only for trial & beta testing
  const isAdmin = dbUser.role === "ADMIN"
  if (!isAdmin) redirect("/forbidden")

  return <LightEstimationClient stores={[]} />
}
