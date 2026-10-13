"use client"

import { useState, useTransition } from "react"
import { useLanguage } from "@/components/language-provider"
import { setFamilyUpdatesEnabled } from "@/app/actions/notification-prefs"
import { cn } from "@/lib/utils"

export function FamilyUpdatesToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const { t } = useLanguage()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [error, setError] = useState(false)
  const [pending, startTransition] = useTransition()

  function toggle() {
    const next = !enabled
    setEnabled(next)
    setError(false)
    startTransition(async () => {
      try {
        await setFamilyUpdatesEnabled(next)
      } catch {
        setEnabled(!next)
        setError(true)
      }
    })
  }

  return (
    <div className="border-t border-mint pt-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div id="family-updates-label" className="text-[13px] font-medium text-foreground">
            {t("familyUpdates")}
          </div>
          <div className="text-[11px] leading-relaxed text-muted-foreground">{t("familyUpdatesHint")}</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-labelledby="family-updates-label"
          disabled={pending}
          onClick={toggle}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer disabled:opacity-60",
            enabled ? "bg-primary" : "bg-border",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform",
              enabled ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {t("notificationsFailed")}
        </p>
      )}
    </div>
  )
}
