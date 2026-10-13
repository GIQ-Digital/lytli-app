"use client"

import { useLanguage } from "@/components/language-provider"

/** Always-visible bar shown below the emergency banner. */
export function MedicalDisclaimerBar() {
  const { t } = useLanguage()
  return (
    <div className="border-b border-border/60 bg-disclaimer px-4 py-1.5 text-center text-[10px] leading-snug text-disclaimer-foreground">
      {t("disclaimerBar")}
    </div>
  )
}

/** Wellness disclaimer shown on every Ask Lytli answer card. */
export function WellnessDisclaimer() {
  const { t } = useLanguage()
  return (
    <p className="mt-2 border-t border-mint pt-2 text-[11px] italic leading-relaxed text-green-dark">
      {t("wellnessDisclaimer")}
    </p>
  )
}
