"use client"

import { useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { LanguageToggle } from "@/components/language-toggle"
import { LytliLogo } from "@/components/lytli-logo"
import { authClient } from "@/lib/auth-client"
import { INVITE_COOKIE, inviteAcceptPath } from "@/lib/invite"

const DEFAULT_CALLBACK_URL = "/home"

const inputClass =
  "w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40"
const primaryButtonClass =
  "w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#1f7a52] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

function rememberInvite(code: string | null) {
  if (!code) return
  document.cookie = `${INVITE_COOKIE}=${encodeURIComponent(code)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`
}

export function LoginForm({ invite = null }: { invite?: string | null }) {
  const { t } = useLanguage()
  const CALLBACK_URL = invite ? inviteAcceptPath(invite) : DEFAULT_CALLBACK_URL
  const [mode, setMode] = useState<"password" | "magic">("password")
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const legal = t("loginLegal")
  const [beforeTerms, rest] = legal.split("{terms}")
  const [betweenLinks, afterPrivacy] = rest.split("{privacy}")

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    rememberInvite(invite)
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: CALLBACK_URL,
    })
    if (error) {
      console.log("[v0] Google sign-in failed:", error.message)
      setGoogleLoading(false)
      setError(t("googleAuthError"))
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    rememberInvite(invite)
    const trimmedEmail = email.trim()
    const { error } = isSignUp
      ? await authClient.signUp.email({
          email: trimmedEmail,
          password,
          name: trimmedEmail.split("@")[0],
          callbackURL: CALLBACK_URL,
        })
      : await authClient.signIn.email({
          email: trimmedEmail,
          password,
          callbackURL: CALLBACK_URL,
        })
    if (error) {
      setLoading(false)
      setError(t("passwordAuthError"))
      return
    }
    window.location.href = CALLBACK_URL
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    rememberInvite(invite)
    const { error } = await authClient.signIn.magicLink({
      email: email.trim(),
      callbackURL: CALLBACK_URL,
    })
    setLoading(false)
    if (error) {
      setError(t("magicError"))
      return
    }
    setSent(true)
  }

  function switchMode(next: "password" | "magic") {
    setError(null)
    setMode(next)
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-card px-6 pb-10 pt-14">
      <div className="mb-8 flex w-full justify-end">
        <LanguageToggle variant="dropdown" />
      </div>

      <LytliLogo size={64} className="mb-4" />
      <h1 className="mb-1 text-[28px] font-semibold text-primary">Lytli</h1>
      <p className="mb-10 text-sm text-muted-foreground">{t("tagline")}</p>

      <div className="w-full">
        {sent ? (
          <div className="flex flex-col items-center rounded-2xl border border-mint-border bg-mint px-6 py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground">
              ✓
            </div>
            <p className="text-sm leading-relaxed text-green-darker">{t("magicSent")}</p>
            <p className="mt-2 text-xs text-muted-foreground">{email}</p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-5 text-sm font-medium text-primary underline cursor-pointer"
            >
              {t("useAnotherEmail")}
            </button>
          </div>
        ) : mode === "magic" ? (
          <>
            <form onSubmit={handleMagicLink}>
              <label htmlFor="magic-email" className="mb-1.5 block text-[13px] font-medium text-foreground">
                {t("signInWithEmail")}
              </label>
              <input
                id="magic-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className={`mb-3 ${inputClass}`}
              />
              {error && <p className="mb-3 text-xs text-destructive">{error}</p>}
              <button type="submit" disabled={loading || !email} className={primaryButtonClass}>
                {loading ? t("sending") : t("sendMagicLink")}
              </button>
            </form>
            <button
              type="button"
              onClick={() => switchMode("password")}
              className="mt-4 w-full text-center text-sm font-medium text-primary underline cursor-pointer"
            >
              {t("backToPassword")}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <GoogleIcon />
              {googleLoading ? t("signingIn") : t("continueGoogle")}
            </button>

            <Divider label={t("authOr")} />

            <form onSubmit={handlePassword}>
              <label htmlFor="auth-email" className="mb-1.5 block text-[13px] font-medium text-foreground">
                {t("signInWithEmail")}
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className={`mb-3 ${inputClass}`}
              />
              <label htmlFor="auth-password" className="mb-1.5 block text-[13px] font-medium text-foreground">
                {t("passwordLabel")}
              </label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={8}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                className={`mb-3 ${inputClass}`}
              />
              {error && <p className="mb-3 text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email || password.length < 8}
                className={primaryButtonClass}
              >
                {loading ? t("signingIn") : isSignUp ? t("createAccountButton") : t("signInButton")}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setError(null)
                setIsSignUp((v) => !v)
              }}
              className="mt-4 w-full text-center text-sm font-medium text-primary cursor-pointer hover:underline"
            >
              {isSignUp ? t("haveAccountAlready") : t("noAccountYet")}
            </button>

            <Divider label={t("orUseMagicLink")} />

            <button
              type="button"
              onClick={() => switchMode("magic")}
              className="w-full rounded-full border border-primary py-3.5 text-sm font-medium text-primary transition-colors hover:bg-mint cursor-pointer"
            >
              {t("sendMagicLink")}
            </button>
          </>
        )}

        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          {beforeTerms}
          <Link href="/terms" className="text-green-dark underline">
            {t("termsOfService")}
          </Link>
          {betweenLinks}
          <Link href="/privacy" className="text-green-dark underline">
            {t("privacyPolicy")}
          </Link>
          {afterPrivacy}
        </p>
      </div>

      <p className="mt-auto pt-8 text-xs text-muted-foreground">{t("giqProduct")}</p>
    </div>
  )
}
