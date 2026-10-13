"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { LanguageToggle } from "@/components/language-toggle"
import { LogoutButton } from "@/components/logout-button"
import { SectionLabel } from "@/components/lytli-ui"
import { saveCheckin } from "@/app/actions/wellness"
import { FREE_SESSION_LIMIT } from "@/lib/subscription"

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const pct = ((value - 1) / 4) * 100
  return (
    <div className="mb-3">
      <label className="mb-1.5 block text-xs text-amber-text">{label}</label>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-amber-border accent-[#BA7517]"
        style={{ background: `linear-gradient(to right, #BA7517 ${pct}%, #FAC775 ${pct}%)` }}
      />
    </div>
  )
}

export function ProfileClient({
  caregiverName,
  recipientName,
  recipientAge,
  relationship,
  conditions,
  pro,
  sessionsRemaining,
  familySeats,
  familySeatsUsed,
  latest,
}: {
  caregiverName: string
  recipientName: string
  recipientAge: number | null
  relationship: string | null
  conditions: string[]
  pro: boolean
  sessionsRemaining: number | null
  familySeats: number
  familySeatsUsed: number
  latest: { mood: number; energy: number; stress: number; sleep: number } | null
}) {
  const { t } = useLanguage()
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    mood: latest?.mood ?? 3,
    energy: latest?.energy ?? 3,
    stress: latest?.stress ?? 3,
    sleep: latest?.sleep ?? 3,
  })

  function save() {
    startTransition(async () => {
      await saveCheckin(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const initial = (recipientName || "?").slice(0, 1).toUpperCase()

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <LanguageToggle variant="pills" />
      </div>

      <div className="mx-auto mb-2.5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
        {initial}
      </div>
      <div className="text-center text-lg font-semibold text-foreground">{recipientName}</div>
      <div className="mb-3 text-center text-[13px] text-muted-foreground">
        {recipientAge ? `${recipientAge} ${t("years")}` : ""}
        {recipientAge && relationship ? " · " : ""}
        {relationship ?? ""}
      </div>
      {conditions.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-center gap-1.5">
          {conditions.map((c) => (
            <span key={c} className="rounded-full border border-mint-border bg-mint px-3 py-1 text-xs text-green-darker">
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Weekly check-in */}
      <div className="mb-3.5 rounded-2xl border border-amber-border bg-amber p-4">
        <span className="mb-2 inline-block rounded-full bg-amber-border px-2.5 py-1 text-[11px] font-semibold text-amber-text">
          {t("weeklyCheckin")}
        </span>
        <h2 className="mb-3.5 text-[15px] font-semibold text-amber-title">
          {caregiverName ? `${t("howAreYou")}, ${caregiverName}?` : `${t("howAreYou")}?`}
        </h2>
        <Slider label={t("moodLevel")} value={form.mood} onChange={(v) => setForm((f) => ({ ...f, mood: v }))} />
        <Slider label={t("energyLevel")} value={form.energy} onChange={(v) => setForm((f) => ({ ...f, energy: v }))} />
        <Slider label={t("stressLevel")} value={form.stress} onChange={(v) => setForm((f) => ({ ...f, stress: v }))} />
        <Slider label={t("sleepLevel")} value={form.sleep} onChange={(v) => setForm((f) => ({ ...f, sleep: v }))} />
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="mt-1 w-full rounded-full bg-[#BA7517] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {pending ? t("saving") : saved ? t("checkinSaved") : t("saveCheckin")}
        </button>
      </div>

      <div className="my-3.5 h-px bg-border" />

      <SectionLabel>{t("myAccount")}</SectionLabel>
      <div className="mb-3 rounded-2xl border border-border bg-card px-4">
        <div className="flex items-center justify-between border-b border-mint py-2.5">
          <span className="text-[13px] text-foreground">{t("plan")}</span>
          <span className="text-[13px] font-medium text-green-dark">
            {pro ? t("currentPlanPro") : t("currentPlanFree")}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-mint py-2.5">
          <span className="text-[13px] text-foreground">{t("familyCircleSeats")}</span>
          <span className="text-[13px] font-medium text-green-dark">
            {familySeatsUsed} {t("of")} {familySeats} {t("seats")}
          </span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-[13px] text-foreground">{t("sessionsLeft")}</span>
          <span className="text-[13px] font-medium text-green-dark">
            {pro ? "∞" : `${sessionsRemaining ?? 0} ${t("of")} ${FREE_SESSION_LIMIT}`}
          </span>
        </div>
      </div>

      <Link
        href="/billing"
        className="mb-3 block w-full rounded-xl border-[1.5px] border-primary bg-card py-3 text-center text-[13px] font-medium text-primary transition-colors hover:bg-secondary cursor-pointer"
      >
        {t("managePlan")}
      </Link>

      <div className="mb-3 flex justify-center gap-4">
        <Link href="/terms" className="text-xs text-green-dark underline">{t("termsOfService")}</Link>
        <Link href="/privacy" className="text-xs text-green-dark underline">{t("privacyPolicy")}</Link>
        <Link href="/disclaimer" className="text-xs text-green-dark underline">{t("medicalDisclaimerLink")}</Link>
      </div>

      <div className="mb-2.5">
        <LogoutButton />
      </div>

      <p className="text-center text-[11px] text-muted-foreground">{t("profileFooter")}</p>
    </div>
  )
}
