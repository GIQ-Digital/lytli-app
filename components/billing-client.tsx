"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { LanguageToggle } from "@/components/language-toggle"
import { ProCheckout } from "@/components/pro-checkout"
import { cancelPro } from "@/app/actions/subscription"
import { REGION_ORDER, REGION_PRICES, type PriceRegion } from "@/lib/pricing"
import { cn } from "@/lib/utils"

type Sub = {
  plan: "free" | "pro"
  status: string | null
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
}

const REGION_LABEL_KEY = {
  americas: "regionAmericas",
  brasil: "regionBrasil",
  international: "regionInternational",
} as const

export function BillingClient({ subscription, region }: { subscription: Sub; region: PriceRegion }) {
  const { t, lang } = useLanguage()
  const router = useRouter()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isTrialing = subscription.plan === "pro" && subscription.status === "trialing"
  const isPro = subscription.plan === "pro" && (subscription.status === "active" || isTrialing)

  const periodEnd = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString(
        lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US",
        { day: "numeric", month: "short", year: "numeric" },
      )
    : null

  function handleCancel() {
    if (!confirm(t("cancelConfirm"))) return
    startTransition(async () => {
      await cancelPro()
      router.refresh()
    })
  }

  const statusLabel = subscription.cancelAtPeriodEnd
    ? t("willCancel")
    : isTrialing
      ? t("trialing")
      : t("proActive")

  const periodLabel = subscription.cancelAtPeriodEnd
    ? t("willCancel")
    : isTrialing
      ? t("trialEnds")
      : t("renews")

  return (
    <div className="min-h-full px-5 pb-8 pt-4">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            aria-label={t("cancel")}
            className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full text-green-dark hover:bg-green-light"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold text-foreground">{t("managePlan")}</h1>
        </div>
        <LanguageToggle variant="pills" />
      </header>

      {isPro ? (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-green-dark">Lytli Pro</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {REGION_PRICES[region].amount[lang]}
              </p>
            </div>
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              {statusLabel}
            </span>
          </div>
          {periodEnd && (
            <p className="mt-3 text-xs text-green-dark">
              {periodLabel} · {periodEnd}
            </p>
          )}
          <PerkList title={t("proIncludes")} perks={[t("perkAi"), t("perkSeats"), t("perkSummaries")]} />
        </section>
      ) : (
        <section aria-labelledby="pricing-title">
          <h2 id="pricing-title" className="text-base font-semibold text-foreground text-balance">
            {t("regionalPricingTitle")}
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-green-dark text-pretty">
            {t("regionalPricingNote")}
          </p>

          <ul className="mt-4 flex flex-col gap-3">
            {REGION_ORDER.map((r) => {
              const isCurrent = r === region
              return (
                <li
                  key={r}
                  aria-current={isCurrent ? "true" : undefined}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm",
                    isCurrent ? "border-primary ring-2 ring-primary/20" : "border-border opacity-80",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span aria-hidden="true" className="text-2xl leading-none">
                      {REGION_PRICES[r].flag}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{t(REGION_LABEL_KEY[r])}</p>
                      <p className="mt-0.5 text-[15px] font-medium text-foreground">
                        {REGION_PRICES[r].amount[lang]}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="whitespace-nowrap rounded-full bg-mint px-2.5 py-1 text-[11px] font-medium text-green-darker">
                      {t("freeTrialBadge")}
                    </span>
                    {isCurrent && (
                      <span className="whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary-foreground">
                        {t("yourRegion")}
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <PerkList title={t("proIncludes")} perks={[t("perkAi"), t("perkSeats"), t("perkSummaries")]} />
          </div>
        </section>
      )}

      <div className="mt-5">
        {!isPro && !checkoutOpen && (
          <button
            type="button"
            onClick={() => setCheckoutOpen(true)}
            className="flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("startFreeTrial")}
          </button>
        )}

        {!isPro && checkoutOpen && (
          <div className="rounded-2xl border border-border bg-card p-2 shadow-sm">
            <ProCheckout />
          </div>
        )}

        {isPro && !subscription.cancelAtPeriodEnd && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("cancelSubscription")}
          </button>
        )}
      </div>
    </div>
  )
}

function PerkList({ title, perks }: { title: string; perks: string[] }) {
  return (
    <>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-green-dark first:mt-0">{title}</p>
      <ul className="mt-2 flex flex-col gap-2">
        {perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-[13px] text-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="leading-relaxed">{perk}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
