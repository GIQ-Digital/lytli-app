"use client"

import { useEffect, useState } from "react"
import { Bell, Loader2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

type Status = "loading" | "enabled" | "disabled" | "unsupported" | "blocked"

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

function isSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
}

export function NotificationsToggle() {
  const { t } = useLanguage()
  const [status, setStatus] = useState<Status>("loading")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!isSupported()) return setStatus("unsupported")
    if (Notification.permission === "denied") return setStatus("blocked")
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub && Notification.permission === "granted" ? "enabled" : "disabled"))
      .catch(() => setStatus("disabled"))
  }, [])

  async function enable() {
    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      setStatus(permission === "denied" ? "blocked" : "disabled")
      return
    }
    const keyRes = await fetch("/api/notifications/subscribe")
    if (!keyRes.ok) throw new Error("no public key")
    const { publicKey } = (await keyRes.json()) as { publicKey: string }

    const reg = await navigator.serviceWorker.ready
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) }))

    const saveRes = await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    })
    if (!saveRes.ok) throw new Error("save failed")
    setStatus("enabled")
  }

  async function disable() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await fetch("/api/notifications/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
      await sub.unsubscribe()
    }
    setStatus("disabled")
  }

  async function toggle() {
    setBusy(true)
    setError(false)
    try {
      if (status === "enabled") await disable()
      else await enable()
    } catch (err) {
      console.error("[notifications] toggle failed:", err)
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  const checked = status === "enabled"
  const interactive = status === "enabled" || status === "disabled"
  const statusLabel =
    status === "loading"
      ? "…"
      : status === "enabled"
        ? t("notificationsEnabled")
        : status === "unsupported"
          ? t("notificationsUnsupported")
          : status === "blocked"
            ? t("notificationsBlocked")
            : t("notificationsDisabled")

  return (
    <section className="mb-3.5 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Bell className="h-4 w-4 shrink-0 text-green-dark" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p id="notifications-label" className="text-[13px] font-medium text-foreground">
            {t("notifications")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{statusLabel}</p>
        </div>
        {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby="notifications-label"
          disabled={!interactive || busy}
          onClick={toggle}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed ${
            checked ? "bg-primary" : "bg-border"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-card shadow transition-transform ${
              checked ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {t("notificationsFailed")}
        </p>
      )}
    </section>
  )
}
