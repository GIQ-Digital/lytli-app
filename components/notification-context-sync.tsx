"use client"

import { useEffect } from "react"
import { useLanguage } from "@/components/language-provider"
import { syncNotificationContext } from "@/app/actions/notification-prefs"

/** Keeps the user's language and time zone on the server so reminders arrive in the right language and at the right local time. */
export function NotificationContextSync() {
  const { lang } = useLanguage()

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    // The time zone is saved first so today's reminders are queued at the right local times.
    syncNotificationContext({ language: lang, timeZone })
      .then(() => fetch("/api/notifications/schedule-today", { method: "POST" }))
      .catch(() => {})
  }, [lang])

  return null
}
