"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { type Lang, type TKey, t as translate } from "@/lib/i18n"

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = "lytli-lang"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored === "en" || stored === "pt" || stored === "es") {
      setLangState(stored)
    }
  }, [])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
    // Real implementation in Cursor: also persist to patients.language in Supabase
  }, [])

  const t = useCallback((key: TKey) => translate(key, lang), [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
