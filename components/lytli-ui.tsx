"use client"

import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"

export type MedStatus = "done" | "pending" | "missed"

/** Uppercase card label with a green dot, used on home cards. */
export function CardLabel({ children, withDot = true }: { children: React.ReactNode; withDot?: boolean }) {
  return (
    <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-green-dark">
      {withDot && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
      {children}
    </div>
  )
}

/** Plain uppercase section label (no card). */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-green-dark">{children}</div>
  )
}

export function StatusPill({ status, label }: { status: MedStatus; label: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
        status === "done" && "bg-pill-done text-pill-done-foreground",
        status === "pending" && "bg-pill-pending text-pill-pending-foreground",
        status === "missed" && "bg-pill-missed text-pill-missed-foreground",
      )}
    >
      {label}
    </span>
  )
}

/** Header shown on app screens: title/greeting block + language toggle + avatar. */
export function useT() {
  return useLanguage().t
}
