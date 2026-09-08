"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { IconMail, IconLock, IconEye, IconEyeOff } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { signIn } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsPending(true)

    const { error: signInError } = await signIn.email({
      email,
      password,
    })

    if (signInError) {
      setError(
        signInError.message ??
          "Login gagal. Periksa kembali email dan password."
      )
      setIsPending(false)
      return
    }

    const redirectResponse = await fetch("/api/auth/redirect-path")
    const redirectData = (await redirectResponse.json().catch(() => null)) as {
      redirectTo?: string
    } | null

    router.push(redirectData?.redirectTo ?? "/dashboard")
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login ke SPARTA Energy</h1>
          <p className="text-sm text-muted-foreground">
            Masukkan email dan password untuk melanjutkan
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Field>
          <Button
            type="button"
            onClick={() => {
              window.location.href = process.env.NEXT_PUBLIC_SSO_PORTAL_URL || "http://localhost:5173"
            }}
            disabled={isPending}
            className="w-full h-12 text-base font-bold bg-[#005a9e] hover:bg-[#004a80] transition-transform active:scale-[0.98] shadow-md"
          >
            {isPending ? "Masuk..." : "Masuk via SPARTA SSO"}
          </Button>
        </Field>
        <Field className="gap-1">
          <FieldDescription className="text-center text-xs">
            © {new Date().getFullYear()} PT Sumber Alfaria Trijaya, Tbk. Seluruh
            Hak Cipta.
          </FieldDescription>
          <FieldDescription className="text-center text-xs">
            Hanya untuk penggunaan internal.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
