"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

export function SheetModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[430px] rounded-t-3xl border border-border bg-card p-5 pb-8 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-xs font-medium text-body">{label}</span>
      {children}
    </label>
  )
}

export const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
