"use client"

import { useEffect, useRef, useState } from "react"
import { Share, SquarePlus, X } from "lucide-react"
import { LytliLogo } from "@/components/lytli-logo"
import { useLanguage } from "@/components/language-provider"

const STORAGE_KEY = "lytli-install-prompt"
const SHOW_DELAY_MS = 1200

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type Platform = "android" | "ios"

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIos() {
  const ua = navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
}

export function InstallPrompt() {
  const { t } = useLanguage()
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [showIosSteps, setShowIosSteps] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(STORAGE_KEY)) return

    let timer: ReturnType<typeof setTimeout> | undefined

    if (isIos()) {
      timer = setTimeout(() => setPlatform("ios"), SHOW_DELAY_MS)
      return () => clearTimeout(timer)
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      deferredPrompt.current = event as BeforeInstallPromptEvent
      timer = setTimeout(() => setPlatform("android"), SHOW_DELAY_MS)
    }
    const onInstalled = () => {
      localStorage.setItem(STORAGE_KEY, "installed")
      deferredPrompt.current = null
      setPlatform(null)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "dismissed")
    setPlatform(null)
  }

  async function install() {
    if (platform === "ios") {
      setShowIosSteps(true)
      return
    }
    const promptEvent = deferredPrompt.current
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    deferredPrompt.current = null
    localStorage.setItem(STORAGE_KEY, outcome === "accepted" ? "installed" : "dismissed")
    setPlatform(null)
  }

  if (!platform) return null

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 mx-auto w-full max-w-[390px] px-4">
      <section
        role="dialog"
        aria-labelledby="install-title"
        aria-describedby="install-body"
        className="relative flex flex-col gap-4 rounded-2xl border border-mint-border bg-card p-4 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("installNotNow")}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3 pr-6">
          <LytliLogo size={48} className="shrink-0" />
          <div className="flex flex-col gap-0.5">
            <h2 id="install-title" className="text-[15px] font-semibold leading-snug text-foreground text-balance">
              {t("installTitle")}
            </h2>
            <p id="install-body" className="text-[13px] leading-relaxed text-body text-pretty">
              {t("installBody")}
            </p>
          </div>
        </div>

        {showIosSteps ? (
          <ol className="flex flex-col gap-2 rounded-xl bg-mint p-3 text-[14px] text-green-darker">
            <li className="flex items-center gap-2">
              <Share className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>{t("installIosStep1")}</span>
            </li>
            <li className="flex items-center gap-2">
              <SquarePlus className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>{t("installIosStep2")}</span>
            </li>
          </ol>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="flex-1 rounded-xl px-4 py-2.5 text-[14px] font-medium text-green-dark hover:bg-mint"
          >
            {t("installNotNow")}
          </button>
          {showIosSteps ? (
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-[14px] font-semibold text-primary-foreground hover:opacity-90"
            >
              {t("installGotIt")}
            </button>
          ) : (
            <button
              type="button"
              onClick={install}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-[14px] font-semibold text-primary-foreground hover:opacity-90"
            >
              {t("installButton")}
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
