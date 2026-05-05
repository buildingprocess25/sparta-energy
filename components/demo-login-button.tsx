"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconArrowRight, IconLoader2 } from "@tabler/icons-react"
import { signIn } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

const DEMO_EMAIL = "demo@sparta.app"
const DEMO_PASSWORD = "demo-sparta-2025"

export function DemoLoginButton() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDemo() {
    setError(null)
    setIsPending(true)

    const { error: signInError } = await signIn.email({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      callbackURL: "/dashboard",
    })

    if (signInError) {
      setError("Akun demo belum tersedia.")
      setIsPending(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        size="lg"
        variant="outline"
        className="w-full rounded-2xl text-base font-semibold"
        onClick={handleDemo}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <IconLoader2 className="size-4 animate-spin" />
            Masuk...
          </>
        ) : (
          <>
            Coba Demo
            <IconArrowRight data-icon="inline-end" />
          </>
        )}
      </Button>
      {error && (
        <p className="text-center text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
