"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const STORAGE_KEY = "lytli-emergency-dismissed"
const DAY_MS = 24 * 60 * 60 * 1000

export function EmergencyBanner() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const at = Number(raw)
      if (!Number.isNaN(at) && Date.now() - at < DAY_MS) {
        setVisible(false)
      }
    }
  }, [])

  if (!visible) return null

  return (
    <div className="flex items-center justify-between gap-2 bg-emergency px-4 py-2 text-[11px] font-medium text-emergency-foreground">
      <span className="flex-1 text-pretty">{t("emergency")}</span>
      <button
        type="button"
        aria-label={t("dismiss")}
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, String(Date.now()))
          setVisible(false)
        }}
        className="shrink-0 cursor-pointer opacity-70 hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
