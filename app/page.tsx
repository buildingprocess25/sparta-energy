import Image from "next/image"
import Link from "next/link"
import { IconArrowRight } from "@tabler/icons-react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import landingImage from "../assets/landing.png"

export default function Page() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-background">
      {/* Background Decoration */}
      <div className="absolute top-1/4 left-1/2 z-0 h-100 w-100 -translate-x-1/2 -translate-y-1/4 rounded-[100px] bg-primary/5 mix-blend-multiply blur-3xl" />

      {/* Header: Logo */}
      <div className="relative z-10 flex w-full items-center justify-center px-6 pt-16 pb-8">
        <Logo className="scale-110" />
      </div>

      {/* Content: Illustration Placeholder & Text */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
        <Image
          src={landingImage}
          alt="SPARTA Energy Illustration"
          height={450}
          className="mb-10 aspect-square object-cover"
          priority
        />

        <h1 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
          Kendalikan Energi Toko
        </h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          Sistem audit energi untuk memantau efisiensi toko, menemukan
          pemborosan, dan menghasilkan insight.
        </p>
      </div>

      {/* Footer: Action Buttons */}
      <div className="relative z-10 flex w-full flex-col gap-3 p-6 pb-12">
        <Button
          asChild
          size="lg"
          className="w-full rounded-2xl text-base font-semibold"
        >
          {/*nanti ganti ke login*/}
          <Link href="/login">
            Mulai Sekarang
            <IconArrowRight data-icon="inline-end" />
          </Link>
        </Button>

        <Button
          asChild
          size="lg"
          variant="outline"
          className="w-full rounded-2xl text-base font-semibold"
        >
          <Link href="/demo">Coba Demo</Link>
        </Button>
      </div>
    </main>
  )
}
