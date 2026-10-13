"use client"

import Link from "next/link"
import { LanguageToggle } from "@/components/language-toggle"

export function ScreenHeader({
  title,
  sub,
  subClassName = "text-green-dark",
}: {
  title: string
  sub?: string
  subClassName?: string
}) {
  return (
    <header className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {sub && <p className={`mt-0.5 text-xs ${subClassName}`}>{sub}</p>}
      </div>
      <LanguageToggle variant="pills" />
    </header>
  )
}

export function Avatar({ initials, href = "/profile" }: { initials: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Profile"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-[13px] font-medium text-primary-foreground"
    >
      {initials}
    </Link>
  )
}
