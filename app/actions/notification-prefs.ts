"use server"

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { notificationPrefs } from "@/lib/db/schema"
import { getUserId } from "@/lib/auth-helpers"
import { asLang } from "@/lib/family-notify"

function isValidTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz })
    return true
  } catch {
    return false
  }
}

/** Stores the app language and device time zone so scheduled reminders use the right ones. */
export async function syncNotificationContext(input: { language: string; timeZone: string }) {
  const userId = await getUserId()
  const language = asLang(input.language)
  const timeZone = typeof input.timeZone === "string" && input.timeZone.length <= 64 && isValidTimeZone(input.timeZone)
    ? input.timeZone
    : null

  await db
    .insert(notificationPrefs)
    .values({ userId, language, timeZone })
    .onConflictDoUpdate({
      target: notificationPrefs.userId,
      set: { language, ...(timeZone ? { timeZone } : {}), updatedAt: new Date() },
    })
  return { ok: true }
}

export async function getFamilyUpdatesEnabled(): Promise<boolean> {
  const userId = await getUserId()
  const [row] = await db
    .select({ familyUpdates: notificationPrefs.familyUpdates })
    .from(notificationPrefs)
    .where(eq(notificationPrefs.userId, userId))
    .limit(1)
  return row?.familyUpdates ?? true
}

export async function setFamilyUpdatesEnabled(enabled: boolean) {
  const userId = await getUserId()
  const familyUpdates = enabled === true
  await db
    .insert(notificationPrefs)
    .values({ userId, familyUpdates })
    .onConflictDoUpdate({ target: notificationPrefs.userId, set: { familyUpdates, updatedAt: new Date() } })
  return { ok: true, enabled: familyUpdates }
}
