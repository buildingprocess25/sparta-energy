"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsPending(true)

    const { error: signInError } = await signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    })

    if (signInError) {
      setError(signInError.message ?? "Login gagal. Periksa kembali email dan password.")
      setIsPending(false)
      return
    }

    router.push("/dashboard")
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
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="auditor@sparta.id"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background"
            disabled={isPending}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background"
            disabled={isPending}
          />
        </Field>
        <FieldGroup>
          <Field orientation="horizontal">
            <Checkbox id="remember" defaultChecked />
            <FieldLabel htmlFor="remember" className="font-normal">
              Ingat saya
            </FieldLabel>
          </Field>
        </FieldGroup>
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Masuk..." : "Login"}
          </Button>
        </Field>
        <Field className="gap-1">
          <FieldDescription className="text-center text-xs">
            © 2026 Building & Maintenance System
          </FieldDescription>
          <FieldDescription className="text-center text-xs">
            Internal use only.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
