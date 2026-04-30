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
  }, [searchParams])

  return null
}

export default function LoginPage() {
  return (
    <div className="grid min-h-svh">
      <Suspense fallback={null}>
        <LoginToastNotice />
      </Suspense>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-2"
            asChild
          >
            <Link href="/">
              <IconChevronLeft className="size-4" />
              <span className="ml-1 text-sm">Kembali</span>
            </Link>
          </Button>
        </div>
        <div className="flex justify-center gap-2">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Logo className="scale-95" />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
