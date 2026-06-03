import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function AcEstimationPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/login?reason=session-expired")

  redirect("/dashboard?notice=ac-estimation-unavailable")
}
