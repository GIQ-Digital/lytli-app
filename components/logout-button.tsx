"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { authClient } from "@/lib/auth-client"

export function LogoutButton() {
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-medium text-destructive transition-colors hover:bg-muted disabled:opacity-50 cursor-pointer"
    >
      <LogOut className="h-4 w-4" />
      {loading ? t("sending") : t("signOut")}
    </button>
  )
}
