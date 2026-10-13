"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight, KeyRound, Loader2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { LanguageToggle } from "@/components/language-toggle"
import { SectionLabel } from "@/components/lytli-ui"
import { SheetModal, Field, inputClass } from "@/components/sheet-modal"
import { LogoutButton } from "@/components/logout-button"
import { ProCheckout } from "@/components/pro-checkout"
import { authClient } from "@/lib/auth-client"
import { cancelSubscriptionAtPeriodEnd } from "@/app/actions/account"

type PlanState = "trial" | "pro" | "free"

export function AccountClient({
  name,
  email,
  plan,
  trialDaysLeft,
  cancelAtPeriodEnd,
  canCancel,
}: {
  name: string
  email: string
  plan: PlanState
  trialDaysLeft: number | null
  cancelAtPeriodEnd: boolean
  canCancel: boolean
}) {
  const { t } = useLanguage()
  const router = useRouter()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [cancelError, setCancelError] = useState(false)
  const [cancelling, startCancel] = useTransition()

  const initials =
    (name || email)
      .split(/[\s@]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"

  function handleCancel() {
    if (!confirm(t("cancelConfirm"))) return
    setCancelError(false)
    startCancel(async () => {
      const res = await cancelSubscriptionAtPeriodEnd()
      if (!res.ok) setCancelError(true)
      router.refresh()
    })
  }

  return (
    <div>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/home"
            aria-label={t("back")}
            className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full text-green-dark hover:bg-green-light"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-serif text-2xl font-semibold text-foreground">{t("myAccount")}</h1>
        </div>
        <LanguageToggle variant="pills" />
      </header>

      <section className="mb-3.5 flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4">
        <div
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mint text-base font-semibold text-green-darker"
        >
          {initials}
        </div>
        <div className="min-w-0">
          {name && <p className="truncate text-[15px] font-semibold text-foreground">{name}</p>}
          <p className="truncate text-[13px] text-muted-foreground">{email}</p>
        </div>
      </section>

      <SectionLabel>{t("plan")}</SectionLabel>
      <section className="mb-3.5 mt-2 rounded-2xl border border-border bg-card p-4">
        {plan === "free" ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{t("freePlanLabel")}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground text-pretty">
                  {t("freePlanHint")}
                </p>
              </div>
            </div>
            {checkoutOpen ? (
              <div className="mt-3 rounded-2xl border border-border bg-card p-2">
                <ProCheckout />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCheckoutOpen(true)}
                className="mt-3 flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer"
              >
                {t("upgradeToPro")}
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-green-dark">Lytli Pro</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {plan === "trial" && trialDaysLeft !== null
                  ? trialDaysLeft === 1
                    ? t("trialOneDayLeft")
                    : t("trialDaysLeft").replace("{n}", String(trialDaysLeft))
                  : t("proActive")}
              </p>
              {cancelAtPeriodEnd && <p className="mt-0.5 text-xs text-muted-foreground">{t("willCancel")}</p>}
            </div>
            <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              {plan === "trial" ? t("trialing") : t("proActive")}
            </span>
          </div>
        )}
      </section>

      <section className="mb-3.5 rounded-2xl border border-border bg-card px-4">
        <button
          type="button"
          onClick={() => setPasswordOpen(true)}
          className="flex w-full items-center gap-3 border-b border-mint py-3.5 text-left text-[13px] font-medium text-foreground cursor-pointer"
        >
          <KeyRound className="h-4 w-4 text-green-dark" />
          <span className="flex-1">{t("changePassword")}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
        <Link
          href="/privacy"
          className="flex items-center gap-3 border-b border-mint py-3.5 text-[13px] font-medium text-foreground"
        >
          <span className="flex-1">{t("privacyPolicy")}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link href="/terms" className="flex items-center gap-3 py-3.5 text-[13px] font-medium text-foreground">
          <span className="flex-1">{t("termsOfService")}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </section>

      <div className="flex flex-col gap-3">
        <LogoutButton />

        {plan !== "free" && canCancel && !cancelAtPeriodEnd && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-60 cursor-pointer"
          >
            {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("cancelSubscription")}
          </button>
        )}
        {cancelError && (
          <p role="alert" className="text-center text-xs text-destructive">
            {t("cancelFailed")}
          </p>
        )}
      </div>

      <ChangePasswordSheet open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </div>
  )
}

function ChangePasswordSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage()
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirmValue, setConfirmValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)

  function close() {
    setCurrent("")
    setNext("")
    setConfirmValue("")
    setError(null)
    setDone(false)
    onClose()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (next.length < 8) return setError(t("passwordTooShort"))
    if (next !== confirmValue) return setError(t("passwordMismatch"))

    setPending(true)
    const { error: authError } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    })
    setPending(false)

    if (authError) {
      console.log("[account] changePassword failed:", authError.code ?? authError.status)
      return setError(t("passwordChangeFailed"))
    }
    setDone(true)
  }

  return (
    <SheetModal open={open} onClose={close} title={t("changePassword")}>
      {done ? (
        <div>
          <p className="mb-4 rounded-xl bg-mint p-3 text-[13px] text-green-darker">{t("passwordChanged")}</p>
          <button
            type="button"
            onClick={close}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground cursor-pointer"
          >
            {t("installGotIt")}
          </button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <Field label={t("currentPassword")}>
            <input
              type="password"
              autoComplete="current-password"
              required
              className={inputClass}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </Field>
          <Field label={t("newPassword")}>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={inputClass}
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </Field>
          <Field label={t("confirmNewPassword")}>
            <input
              type="password"
              autoComplete="new-password"
              required
              className={inputClass}
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
            />
          </Field>
          {error && (
            <p role="alert" className="mb-3 text-xs text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-colors disabled:opacity-50 cursor-pointer"
          >
            {pending ? t("saving") : t("save")}
          </button>
        </form>
      )}
    </SheetModal>
  )
}
