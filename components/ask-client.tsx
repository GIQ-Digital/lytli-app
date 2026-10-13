"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Search, Lock } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { ScreenHeader } from "@/components/screen-header"
import { CardLabel, SectionLabel } from "@/components/lytli-ui"
import { WellnessDisclaimer } from "@/components/medical-disclaimer"
import { askLytli } from "@/app/actions/ask"
import type { TKey } from "@/lib/i18n"

const chips: TKey[] = ["chipExhausted", "chipGuilt", "chipBreak"]

type QA = { q: string; a: string }

export function AskClient({
  initialHistory,
  pro,
  remaining,
}: {
  initialHistory: QA[]
  pro: boolean
  remaining: number | null
}) {
  const { t, lang } = useLanguage()
  const [input, setInput] = useState("")
  const [pending, startTransition] = useTransition()
  const [answers, setAnswers] = useState<QA[]>(initialHistory)
  const [left, setLeft] = useState<number | null>(remaining)
  const locked = !pro && left !== null && left <= 0

  function submit(question: string) {
    const q = question.trim()
    if (!q || pending || locked) return
    setInput("")
    startTransition(async () => {
      const res = await askLytli({ question: q, language: lang })
      if (!res.ok) {
        setLeft(0)
        return
      }
      setAnswers((prev) => [{ q: res.question, a: res.answer }, ...prev])
      setLeft(res.remaining)
    })
  }

  return (
    <div>
      <ScreenHeader title={t("askLytli")} sub={t("askSub")} subClassName="text-primary font-medium" />

      <div className="mb-3.5 rounded-2xl border border-mint-border bg-mint p-4">
        <CardLabel withDot={false}>{t("askIntroLabel")}</CardLabel>
        <p className="text-[13px] leading-relaxed text-green-darker">{t("askIntro")}</p>
      </div>

      {!pro && left !== null && !locked && (
        <p className="mb-3 text-center text-xs text-muted-foreground">
          {left} {t("of")} 5 {t("sessionsLeft").toLowerCase()}
        </p>
      )}

      {locked ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <p className="mb-4 text-[13px] leading-relaxed text-body">{t("askQuotaLock")}</p>
          <Link
            href="/billing"
            className="block w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#1f7a52] cursor-pointer"
          >
            {t("upgradePro")}
          </Link>
        </div>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit(input)
            }}
            className="mb-3 flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3"
          >
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("askPlaceholder")}
              className="flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </form>

          <div className="mb-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => submit(t(c))}
                className="rounded-full border border-mint-border bg-mint px-3.5 py-1.5 text-xs text-green-darker transition-colors hover:bg-mint-border/50 cursor-pointer"
              >
                {t(c)}
              </button>
            ))}
          </div>

          <SectionLabel>{t("recentAnswers")}</SectionLabel>

          {pending && (
            <div className="mb-2.5 rounded-2xl border border-mint-border bg-mint p-4">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              </div>
            </div>
          )}

          {answers.map((qa, i) => (
            <div key={i} className="mb-2.5 rounded-2xl border border-border bg-card p-4">
              <div className="mb-2 text-[13px] font-semibold text-foreground">{qa.q}</div>
              <p className="text-[13px] leading-relaxed text-body">{qa.a}</p>
              <WellnessDisclaimer />
            </div>
          ))}
        </>
      )}
    </div>
  )
}
