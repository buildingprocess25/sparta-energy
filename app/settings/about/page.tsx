import Image from "next/image"
import { Header } from "@/components/header"
import { IconBrandGithub, IconBuildingStore } from "@tabler/icons-react"
import { Thermometer, UserStar } from "lucide-react"
import { Field, FieldDescription } from "@/components/ui/field"

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col bg-background px-4 pb-16">
      <Header
        variant="dashboard-back"
        title="Tentang Aplikasi"
        backHref="/settings"
        className="px-0"
      />

      <div className="flex flex-col gap-6">
        {/* App identity */}
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-muted/30 px-5 py-3">
            <Image
              src="/assets/Alfamart-Emblem.png"
              alt="Alfamart"
              width={80}
              height={80}
              className="h-8 w-auto object-contain"
              priority
            />
            <div className="h-5 w-px rounded-full bg-border" />
            <div className="flex items-center gap-2">
              <Image
                src="/assets/Building-Logo.png"
                alt="SPARTA"
                width={48}
                height={48}
                className="h-7 w-auto object-contain"
                priority
              />
              <div className="leading-none">
                <p className="text-sm font-bold tracking-wider">SPARTA</p>
                <p className="text-[10px] font-medium text-muted-foreground">
                  Energy
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="mt-1 max-w-72 text-sm text-muted-foreground">
              Sistem audit energi untuk memantau efisiensi toko, menemukan
              pemborosan, dan menghasilkan insight.
            </p>
          </div>
        </div>

        {/* App info */}
        <div className="rounded-xl border bg-card px-4">
          <InfoRow label="Versi" value="1.0.0" />
        </div>

        {/* Features */}
        <div className="rounded-xl border bg-card px-4 py-4">
          <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Fitur Utama
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              {
                icon: IconBuildingStore,
                text: "Audit kondisi energi toko Alfamart",
              },
              {
                icon: Thermometer,
                text: "Estimasi kebutuhan AC berdasarkan suhu di lokasi",
              },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="size-3.5 text-primary" />
                </div>
                <p className="text-sm text-foreground/80">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tim ── */}
        <div className="rounded-xl border bg-card px-4 py-4">
          <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Tim Pengembang
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm">
                  System Development Building Maintenance Energy (BME) Team
                </p>
              </div>
            </div>
          </div>
        </div>

        <Field className="gap-1">
          <FieldDescription className="text-center text-xs">
            © {new Date().getFullYear()} PT Sumber Alfaria Trijaya, Tbk. Seluruh
            Hak Cipta.
          </FieldDescription>
          <FieldDescription className="text-center text-xs">
            Hanya untuk penggunaan internal.
          </FieldDescription>
        </Field>
      </div>
    </main>
  )
}
