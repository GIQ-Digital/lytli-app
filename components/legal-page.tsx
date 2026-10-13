"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import type { TKey } from "@/lib/i18n"

export function LegalPage({
  titleKey,
  bodyKey,
  keyBoxKey,
}: {
  titleKey: TKey
  bodyKey: TKey
  keyBoxKey?: TKey
}) {
  const router = useRouter()
  const { t } = useLanguage()

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[390px] bg-background pb-16">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
        <button
          type="button"
          aria-label="Back"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-serif text-xl font-semibold text-foreground">{t(titleKey)}</h1>
      </header>

      <div className="px-5 py-6">
        {keyBoxKey && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            <p className="text-sm font-medium leading-relaxed text-danger-foreground">{t(keyBoxKey)}</p>
          </div>
        )}

        <div className="space-y-4">
          {t(bodyKey)
            .split("\n\n")
            .map((block, i) => {
              const [heading, ...rest] = block.split("\n")
              const body = rest.join("\n")
              return (
                <section key={i}>
                  <h2 className="mb-1 text-sm font-semibold text-foreground">{heading}</h2>
                  {body && <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{body}</p>}
                </section>
              )
            })}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">{t("lastUpdated")}</p>
      </div>
    </div>
  )
}
