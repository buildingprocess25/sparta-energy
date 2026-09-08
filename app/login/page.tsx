"use client"

import Link from "next/link"
import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { IconChevronLeft } from "@tabler/icons-react"
import { toast } from "sonner"

import { LoginForm } from "@/components/login-form"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

function LoginToastNotice() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const reason = searchParams.get("reason")
    const storedReason = sessionStorage.getItem("auth-toast")

    if (reason === "session-expired" || storedReason === "session-expired") {
      toast.error("Sesi Anda telah berakhir. Silakan login kembali.")
      sessionStorage.removeItem("auth-toast")
    }

    const error = searchParams.get("error")
    if (error === "sso_user_not_found") {
      toast.error("Akun Anda tidak ditemukan di SPARTA Energy.")
    } else if (error === "sso_exchange_failed") {
      toast.error("Gagal melakukan pertukaran token SSO.")
    } else if (error === "sso_token_missing") {
      toast.error("Token SSO tidak valid atau hilang.")
    }
  }, [searchParams])

  return null
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background px-4 py-8 md:p-8">
      {/* Background Ambient Glows & Grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] dark:opacity-25"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 z-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-1/4 z-0 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-[100px]"
        aria-hidden="true"
      />

      <Suspense fallback={null}>
        <LoginToastNotice />
      </Suspense>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl border-0 bg-transparent p-2 md:max-w-md md:border md:border-border/60 md:bg-card/85 md:p-8 md:shadow-2xl md:backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-2 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/">
              <IconChevronLeft className="size-4" />
              <span className="ml-1 text-xs font-medium">Kembali</span>
            </Link>
          </Button>

          <Logo className="scale-90" />
          <div className="w-12" /> {/* Balanced spacer */}
        </div>

        <div className="space-y-1 text-center mb-6">
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Selamat Datang
          </h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            Masuk ke akun SPARTA Energy Anda
          </p>
        </div>

        <div className="w-full">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
