"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { LanguageToggle } from "@/components/language-toggle"
import { LytliLogo } from "@/components/lytli-logo"
import { cn } from "@/lib/utils"
import type { TKey } from "@/lib/i18n"
import { completeOnboarding } from "@/app/actions/onboarding"

const relationships: TKey[] = ["relMom", "relDad", "relSpouse", "relGrandparent", "relOther"]
const challenges: TKey[] = ["challengeMeds", "challengeAppts", "challengeFamily", "challengeOrganized"]
const MAX_CHALLENGES = 3

export function OnboardingForm() {
  const { t } = useLanguage()
  const router = useRouter()
  const [step, setStep] = useState(1)

  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [rel, setRel] = useState<TKey | null>(null)
  const [selectedChallenges, setSelectedChallenges] = useState<TKey[]>([])
  const [checks, setChecks] = useState([false, false, false])
  const [loading, setLoading] = useState(false)

  const allChecked = checks.every(Boolean)

  function toggleCheck(i: number) {
    setChecks((prev) => prev.map((c, idx) => (idx === i ? !c : c)))
  }

  function toggleChallenge(c: TKey) {
    setSelectedChallenges((prev) => {
      if (prev.includes(c)) return prev.filter((x) => x !== c)
      if (prev.length >= MAX_CHALLENGES) return prev
      return [...prev, c]
    })
  }

  async function finish() {
    setLoading(true)
    try {
      await completeOnboarding({
        name,
        age,
        relationship: rel ? t(rel) : undefined,
        challenges: selectedChallenges.map((c) => t(c)),
      })
      router.push("/home")
      router.refresh()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pb-10 pt-14">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <span key={s} className={cn("h-1.5 w-7 rounded-full", s <= step ? "bg-coral" : "bg-border")} />
          ))}
        </div>
        <LanguageToggle variant="dropdown" />
      </div>

      {step === 1 && (
        <div>
          <LytliLogo size={44} className="mb-4" />
          <h1 className="text-[22px] font-semibold text-foreground">{t("onboardWelcome")}</h1>
          <p className="mb-6 mt-1.5 text-[13px] text-muted-foreground">{t("onboardWelcomeSub")}</p>

          <label className="mb-1.5 block text-[13px] font-medium text-foreground">{t("patientNameLabel")}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("patientNamePlaceholder")}
            className="mb-4 w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />

          <div className="mb-4 flex gap-3">
            <div className="w-24">
              <label className="mb-1.5 block text-[13px] font-medium text-foreground">{t("ageLabel")}</label>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder={t("agePlaceholder")}
                className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-[13px] font-medium text-foreground">{t("relationshipLabel")}</label>
              <div className="flex flex-wrap gap-2">
                {relationships.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRel(r)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-xs cursor-pointer transition-colors",
                      rel === r
                        ? "border-primary bg-secondary text-secondary-foreground"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {t(r)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!name || !rel}
            onClick={() => setStep(2)}
            className="mt-4 w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#1f7a52] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {t("next")}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-[22px] font-semibold text-foreground text-balance">{t("challengeTitle")}</h1>
          <p className="mb-6 mt-1.5 text-[13px] text-muted-foreground" aria-live="polite">
            {t("challengeSelectedCount").replace("{n}", String(selectedChallenges.length))}
          </p>
          <div className="flex flex-col gap-3">
            {challenges.map((c) => {
              const isSelected = selectedChallenges.includes(c)
              const isLocked = !isSelected && selectedChallenges.length >= MAX_CHALLENGES
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={isLocked}
                  onClick={() => toggleChallenge(c)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-4 text-left text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
                    isSelected
                      ? "border-primary bg-secondary text-secondary-foreground"
                      : "border-border bg-card text-foreground",
                  )}
                >
                  <span>{t(c)}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs transition-colors",
                      isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                    )}
                  >
                    {isSelected && "✓"}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-full border border-border bg-card px-6 py-3.5 text-sm font-medium text-foreground cursor-pointer"
            >
              {t("back")}
            </button>
            <button
              type="button"
              disabled={selectedChallenges.length === 0}
              onClick={() => setStep(3)}
              className="flex-1 rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#1f7a52] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="text-[22px] font-semibold text-foreground">{t("beforeBegin")}</h1>
          <p className="mb-5 mt-1.5 text-[13px] text-muted-foreground">
            {t("step")} 3 {t("of")} 3 — {t("legalAcceptance")}
          </p>

          <div className="mb-5 rounded-xl border border-amber-border bg-amber p-4">
            <div className="mb-1.5 text-[13px] font-semibold text-amber-text">{t("importantNotice")}</div>
            <p className="text-xs leading-relaxed text-amber-text">{t("onboardWarning")}</p>
          </div>

          {(["onboardCheck1", "onboardCheck2", "onboardCheck3"] as TKey[]).map((k, i) => (
            <button
              key={k}
              type="button"
              onClick={() => toggleCheck(i)}
              className="mb-3.5 flex w-full items-start gap-2.5 text-left cursor-pointer"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs transition-colors",
                  checks[i] ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                )}
              >
                {checks[i] && "✓"}
              </span>
              <span className="text-[13px] leading-snug text-body">{t(k)}</span>
            </button>
          ))}

          <button
            type="button"
            disabled={!allChecked || loading}
            onClick={finish}
            className="mt-4 w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#1f7a52] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {t("createAccount")}
          </button>

          {loading && (
            <div className="mt-3.5 rounded-xl border border-mint-border bg-mint p-3.5 text-center">
              <p className="mb-2 text-xs text-green-darker">{t("lytliThinking")}</p>
              <div className="flex justify-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
