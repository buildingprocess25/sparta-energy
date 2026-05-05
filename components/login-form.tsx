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
      callbackURL: "/dashboard",
    })

    if (signInError) {
      setError(
        signInError.message ??
          "Login gagal. Periksa kembali email dan password."
      )
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
          <div className="relative">
            <IconMail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Masukkan Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background pl-9"
              disabled={isPending}
            />
          </div>
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <div className="relative">
            <IconLock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Masukkan Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background px-9"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <IconEye className="size-4" />
              ) : (
                <IconEyeOff className="size-4" />
              )}
            </button>
          </div>
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
