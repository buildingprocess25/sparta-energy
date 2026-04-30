import type { ComponentType, ReactNode } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type StateBlockAction = {
  label: string
  href?: string
  onClick?: () => void
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | "link"
}

type StateBlockProps = {
  title: string
  description?: string
  icon: ComponentType<{ className?: string }>
  action?: StateBlockAction
  children?: ReactNode
}

export function StateBlock({
  title,
  description,
  icon: Icon,
  action,
  children,
}: StateBlockProps) {
  return (
    <div className="grid min-h-svh place-items-center px-6 py-10">
      <Card className="w-full max-w-xs">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Icon className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <CardTitle>{title}</CardTitle>
              {description ? (
                <CardDescription>{description}</CardDescription>
              ) : null}
            </div>
          </div>
        </CardHeader>
        {children ? <CardContent>{children}</CardContent> : null}
        {action ? (
          <CardFooter>
            {action.href ? (
              <Button asChild variant={action.variant ?? "default"}>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant={action.variant ?? "default"}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </CardFooter>
        ) : null}
      </Card>
    </div>
  )
}
