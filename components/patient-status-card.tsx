"use client"

import { useState, useTransition } from "react"
import { HeartPulse } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { setPatientStatus, type PatientStatusValue } from "@/app/actions/patient-status"
import { cn } from "@/lib/utils"

const OPTIONS: { value: PatientStatusValue; key: "statusWell" | "statusSoso" | "statusUnwell"; active: string }[] = [
  { value: "well", key: "statusWell", active: "border-primary bg-primary text-primary-foreground" },
  { value: "soso", key: "statusSoso", active: "border-amber-500 bg-amber-500 text-primary-foreground" },
  { value: "unwell", key: "statusUnwell", active: "border-destructive bg-destructive text-primary-foreground" },
]

export function PatientStatusCard({
  careProfileId,
  recipientName,
  initialStatus,
  updatedAt,
}: {
  careProfileId: number
  recipientName: string
  initialStatus: PatientStatusValue | null
  updatedAt: string | null
}) {
  const { t, lang } = useLanguage()
  const [status, setStatus] = useState(initialStatus)
  const [lastUpdate, setLastUpdate] = useState(updatedAt)
  const [error, setError] = useState(false)
  const [pending, startTransition] = useTransition()

  function choose(next: PatientStatusValue) {
    if (pending || next === status) return
    const previous = status
    setStatus(next)
    setError(false)
    startTransition(async () => {
      try {
        await setPatientStatus(careProfileId, next)
        setLastUpdate(new Date().toISOString())
      } catch {
        setStatus(previous)
        setError(true)
      }
    })
  }

  return (
    <section aria-labelledby="patient-status-title" className="mb-3.5 rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2
          id="patient-status-title"
          className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
        >
          <HeartPulse className="h-3.5 w-3.5" /> {t("patientStatus")}
        </h2>
        {lastUpdate && (
          <span className="text-[11px] text-muted-foreground">
            {new Date(lastUpdate).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
      <p className="mb-3 text-[13px] text-foreground">
        {t("patientStatusQuestion").replace("{name}", recipientName)}
      </p>
      <div role="radiogroup" aria-labelledby="patient-status-title" className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const selected = status === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={pending}
              onClick={() => choose(opt.value)}
              className={cn(
                "rounded-xl border-[1.5px] px-2 py-2.5 text-[12px] font-medium leading-tight transition-colors cursor-pointer disabled:cursor-wait",
                selected ? opt.active : "border-border bg-background text-foreground hover:bg-secondary",
              )}
            >
              {t(opt.key)}
            </button>
          )
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {t("patientStatusFailed")}
        </p>
      )}
      <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">{t("patientStatusHint")}</p>
    </section>
  )
}
