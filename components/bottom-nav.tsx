"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Clock, Droplet, Calendar, Users } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { medications } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { TKey } from "@/lib/i18n"

const items: { href: string; icon: typeof LayoutGrid; labelKey: TKey; badge?: boolean }[] = [
  { href: "/home", icon: LayoutGrid, labelKey: "navHome" },
  { href: "/medications", icon: Clock, labelKey: "navMeds", badge: true },
  { href: "/ask", icon: Droplet, labelKey: "navAsk" },
  { href: "/schedule", icon: Calendar, labelKey: "navSchedule" },
  { href: "/family", icon: Users, labelKey: "navFamily" },
]

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const hasMissed = medications.some((m) => m.status === "missed")

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[390px] border-t border-border bg-card px-0 pb-4 pt-2">
      {items.map((item) => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="relative flex flex-1 flex-col items-center gap-1"
          >
            <Icon
              className={cn("h-5 w-5 transition-colors", active ? "text-primary" : "text-muted-foreground")}
              strokeWidth={1.75}
            />
            {item.badge && hasMissed && (
              <span className="absolute right-[calc(50%-14px)] top-[-2px] h-2 w-2 rounded-full bg-destructive" />
            )}
            <span
              className={cn(
                "text-[10px] transition-colors",
                active ? "font-medium text-primary" : "text-muted-foreground",
              )}
            >
              {t(item.labelKey)}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
