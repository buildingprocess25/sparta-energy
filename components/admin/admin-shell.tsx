"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  IconBuildingStore,
  IconCheck,
  IconChevronRight,
  IconClipboardList,
  IconDatabase,
  IconDeviceDesktop,
  IconFileExport,
  IconKey,
  IconLayoutDashboard,
  IconLogout,
  IconMoon,
  IconSun,
  IconTool,
  IconUsers,
} from "@tabler/icons-react"
import {
  Fragment,
  Suspense,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react"

import { AdminDashboardFilters } from "@/components/admin/admin-dashboard-filters"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { signOut } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { ChartNoAxesColumn } from "lucide-react"

type AdminUser = {
  fullName: string | null
  email: string
  image: string | null
}

type AdminShellProps = {
  user: AdminUser
  children: ReactNode
}

type AdminNavItem = {
  label: string
  href: string
  icon: ComponentType<React.ComponentProps<"svg">>
  disabled?: boolean
}

type AdminNavGroup = {
  label: string
  items: AdminNavItem[]
}

const dashboardNavItem: AdminNavItem = {
  label: "Dashboard",
  href: "/admin/dashboard",
  icon: IconLayoutDashboard,
}

const navGroups: AdminNavGroup[] = [
  {
    label: "Monitoring",
    items: [
      {
        label: "Monitoring Toko",
        href: "/admin/stores",
        icon: IconBuildingStore,
      },
      {
        label: "Riwayat Audit",
        href: "/admin/audits",
        icon: IconClipboardList,
      },
      {
        label: "Analitik Equipment",
        href: "/admin/equipment",
        icon: IconTool,
      },
      {
        label: "Performa Cabang",
        href: "/admin/branches",
        icon: ChartNoAxesColumn,
      },
    ],
  },
  {
    label: "Output",
    items: [
      {
        label: "Reports & Export",
        href: "/admin/reports",
        icon: IconFileExport,
      },
    ],
  },
  {
    label: "Administrasi",
    items: [
      {
        label: "User & Akses",
        href: "/admin/users",
        icon: IconUsers,
      },
      {
        label: "Master Data",
        href: "/admin/master-data",
        icon: IconDatabase,
      },
    ],
  },
]

const navItems = [
  dashboardNavItem,
  ...navGroups.flatMap((group) => group.items),
]

const themeOptions = [
  { value: "light", label: "Terang", icon: IconSun },
  { value: "dark", label: "Gelap", icon: IconMoon },
  { value: "system", label: "Sistem", icon: IconDeviceDesktop },
] as const

function getInitials(name: string | null, email: string) {
  const source = name?.trim() || email
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function getCurrentPage(pathname: string) {
  return navItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )
}

function getBreadcrumbItems(pathname: string) {
  const currentPage = getCurrentPage(pathname)

  if (pathname === "/admin/dashboard") {
    return [{ label: "Dashboard" }]
  }

  if (pathname.startsWith("/admin/stores/")) {
    return [
      { label: "Monitoring Toko", href: "/admin/stores" },
      { label: "Detail Toko" },
    ]
  }

  if (pathname.startsWith("/admin/audits/")) {
    return [
      { label: "Riwayat Audit", href: "/admin/audits" },
      { label: "Detail Audit" },
    ]
  }

  if (currentPage) {
    return [{ label: currentPage.label }]
  }

  return [{ label: "Dashboard" }]
}

async function handleLogout() {
  await signOut()
  window.location.href = "/login"
}

function AdminSidebar({ user }: { user: AdminUser }) {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="[&_[data-slot=sidebar-inner]]:relative [&_[data-slot=sidebar-inner]]:overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,var(--sidebar)_0%,color-mix(in_oklch,var(--sidebar)_88%,var(--primary)_12%)_48%,var(--sidebar)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 [background-image:linear-gradient(to_right,var(--sidebar-foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--sidebar-foreground)_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.045]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-28 bg-linear-to-b from-primary/10 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-0 w-px bg-linear-to-b from-transparent via-primary/35 to-transparent"
      />

      <SidebarHeader className="relative z-10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="SPARTA Energy"
              className="h-auto justify-center bg-background/35 p-2 shadow-[0_12px_32px_-26px_var(--primary)] ring-1 ring-sidebar-border/70 backdrop-blur transition-all group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! hover:bg-sidebar-accent/70 hover:shadow-[0_14px_36px_-24px_var(--primary)]"
            >
              <Link href="/admin/dashboard">
                <Logo className="scale-90 group-data-[collapsible=icon]:hidden" />
                <div className="hidden size-8 items-center justify-center rounded-lg group-data-[collapsible=icon]:flex">
                  <Image
                    src="/assets/Building-Logo.png"
                    alt="SPARTA Energy"
                    width={60}
                    height={60}
                    className="size-6 object-contain drop-shadow-sm"
                    priority
                  />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="relative z-10">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <AdminSidebarItem item={dashboardNavItem} pathname={pathname} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-sidebar-foreground/55 group-data-[collapsible=icon]:opacity-0">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <AdminSidebarItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="relative z-10">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  id="admin-sidebar-profile-trigger"
                  size="lg"
                  className="group/profile-trigger bg-background/30 shadow-[0_12px_28px_-24px_var(--sidebar-foreground)] ring-1 ring-sidebar-border/60 backdrop-blur transition-all group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center hover:bg-sidebar-accent/70 hover:shadow-[0_14px_34px_-24px_var(--primary)]"
                >
                  <Avatar>
                    {user.image && (
                      <AvatarImage
                        src={user.image}
                        alt={user.fullName ?? user.email}
                      />
                    )}
                    <AvatarFallback>
                      {getInitials(user.fullName, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">
                      {user.fullName ?? "Admin"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </span>
                  <IconChevronRight className="ml-auto transition-transform group-data-[collapsible=icon]:hidden group-data-[state=open]/profile-trigger:rotate-90" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "top" : "right"}
                align="end"
                className="w-(--radix-popper-anchor-width)"
              >
                <DropdownMenuLabel>
                  <span className="block truncate font-medium text-foreground">
                    {user.fullName ?? "Admin"}
                  </span>
                  <span className="block truncate">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <IconClipboardList />
                      Pindah ke Mode Auditor
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild disabled>
                    <Link href="#">
                      <IconKey />
                      Ganti Password
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    <IconLogout />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function ThemeModeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const activeTheme = mounted ? (theme ?? "system") : "system"
  const activeOption =
    themeOptions.find((option) => option.value === activeTheme) ??
    themeOptions[2]
  const ActiveIcon = activeOption.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id="admin-theme-trigger"
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Pilih tema"
          title="Pilih tema"
          className="bg-background/60"
        >
          <ActiveIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themeOptions.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
            <Icon />
            {label}
            {activeTheme === value && <IconCheck className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function HeaderProfileMenu({ user }: { user: AdminUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id="admin-header-profile-trigger"
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Profil"
          title="Profil"
          className="bg-background/60"
        >
          <Avatar>
            {user.image && (
              <AvatarImage src={user.image} alt={user.fullName ?? user.email} />
            )}
            <AvatarFallback>
              {getInitials(user.fullName, user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <span className="block truncate font-medium text-foreground">
            {user.fullName ?? "Admin"}
          </span>
          <span className="block truncate">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <IconClipboardList />
              Pindah ke Mode Auditor
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild disabled>
            <Link href="#">
              <IconKey />
              Ganti Password
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <IconLogout />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DashboardGlobalFilters() {
  const [branches, setBranches] = useState<string[]>([])
  const [storeTypes, setStoreTypes] = useState<string[]>([])
  const [years, setYears] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    fetch("/admin/dashboard/filter-options")
      .then((response) => (response.ok ? response.json() : null))
      .then(
        (
          data: {
            branches?: string[]
            storeTypes?: string[]
            years?: string[]
          } | null
        ) => {
          if (!isMounted) return

          setBranches(data?.branches ?? [])
          setStoreTypes(data?.storeTypes ?? [])
          setYears(data?.years ?? [])
        }
      )
      .catch(() => {
        if (!isMounted) return

        setBranches([])
        setStoreTypes([])
        setYears([])
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <AdminDashboardFilters
      branches={branches}
      storeTypes={storeTypes}
      years={years}
    />
  )
}

function AdminHeaderActions({
  user,
  showGlobalFilters,
}: {
  user: AdminUser
  showGlobalFilters: boolean
}) {
  return (
    <div className="ml-auto flex items-center gap-2">
      {showGlobalFilters && (
        <Suspense fallback={null}>
          <DashboardGlobalFilters />
        </Suspense>
      )}
      <ThemeModeToggle />
      <HeaderProfileMenu user={user} />
    </div>
  )
}

function AdminSidebarItem({
  item,
  pathname,
}: {
  item: AdminNavItem
  pathname: string
}) {
  const Icon = item.icon
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`)

  return (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton
        asChild={!item.disabled}
        disabled={item.disabled}
        isActive={isActive}
        tooltip={item.label}
        className={cn(
          "relative transition-[background-color,box-shadow,color,transform] duration-200 hover:bg-sidebar-accent/70 hover:shadow-[0_12px_30px_-24px_var(--primary)] [&_svg]:transition-colors",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-linear-to-r after:from-primary/10 after:via-chart-1/8 after:to-transparent after:opacity-0 after:transition-opacity",
          "hover:after:opacity-100",
          isActive &&
            "bg-sidebar-accent/85 text-sidebar-accent-foreground shadow-[0_14px_34px_-24px_var(--primary)] ring-1 ring-sidebar-border/70 after:opacity-100 [&_svg]:text-primary",
          item.disabled && "opacity-55 hover:shadow-none hover:after:opacity-0"
        )}
      >
        {item.disabled ? (
          <>
            <Icon />
            <span>{item.label}</span>
          </>
        ) : (
          <Link href={item.href}>
            <Icon />
            <span>{item.label}</span>
          </Link>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function AdminSiteHeader({ user }: { user: AdminUser }) {
  const pathname = usePathname()
  const breadcrumbItems = getBreadcrumbItems(pathname)
  const showGlobalFilters = pathname === "/admin/dashboard"

  return (
    <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/60 bg-background/78 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) supports-[backdrop-filter]:bg-background/70">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <div className="flex h-full items-center">
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
        </div>
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1

              return (
                <Fragment key={`${item.label}-${index}`}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast || !item.href ? (
                      <BreadcrumbPage className="font-medium">
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <AdminHeaderActions user={user} showGlobalFilters={showGlobalFilters} />
      </div>
    </header>
  )
}

export function AdminShell({ user, children }: AdminShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "18rem",
            "--header-height": "3.5rem",
          } as CSSProperties
        }
      >
        <AdminSidebar user={user} />
        <SidebarInset>
          <AdminSiteHeader user={user} />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
