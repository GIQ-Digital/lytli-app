"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/components/language-provider"
import { LANGS } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function LanguageToggle({ variant = "pills" }: { variant?: "pills" | "dropdown" }) {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  if (variant === "pills") {
    return (
      <div className="flex gap-1" role="group" aria-label="Language">
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={lang === l.code}
            className={cn(
              "rounded-full border px-2 py-1 text-[10px] font-medium transition-colors cursor-pointer",
              lang === l.code
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
    )
  }

  const current = LANGS.find((l) => l.code === lang)!

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground cursor-pointer"
      >
        <span aria-hidden>{current.flag}</span>
        {current.label}
        <span aria-hidden className="text-muted-foreground">
          ▾
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
        >
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang === l.code}
                onClick={() => {
                  setLang(l.code)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-popover-foreground hover:bg-secondary cursor-pointer"
              >
                <span aria-hidden>{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {lang === l.code && <span className="text-primary">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
