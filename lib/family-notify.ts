import "server-only"

import { and, eq, ne, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { familyMembers, notificationPrefs, user } from "@/lib/db/schema"
import { sendNotification, type LocalizedText } from "@/lib/notify"

export type NotifyLang = "pt" | "en" | "es"

export function asLang(value: string | null | undefined): NotifyLang {
  return value === "en" || value === "es" || value === "pt" ? value : "pt"
}

export async function getUserLanguage(userId: string): Promise<NotifyLang> {
  const [row] = await db
    .select({ language: notificationPrefs.language })
    .from(notificationPrefs)
    .where(eq(notificationPrefs.userId, userId))
    .limit(1)
  return asLang(row?.language)
}

/** Registered family members linked to the caregiver who have family updates turned on. */
async function getFamilyRecipients(caregiverId: string) {
  const rows = await db
    .select({
      userId: user.id,
      language: notificationPrefs.language,
      familyUpdates: notificationPrefs.familyUpdates,
    })
    .from(familyMembers)
    .innerJoin(user, sql`lower(${user.email}) = lower(${familyMembers.email})`)
    .leftJoin(notificationPrefs, eq(notificationPrefs.userId, user.id))
    .where(and(eq(familyMembers.userId, caregiverId), eq(familyMembers.status, "active"), ne(user.id, caregiverId)))

  const seen = new Set<string>()
  return rows.filter((r) => {
    if (r.familyUpdates === false || seen.has(r.userId)) return false
    seen.add(r.userId)
    return true
  })
}

/** Sends the same update to every opted-in family member, each in their own language. Never throws. */
export async function notifyFamily(caregiverId: string, title: LocalizedText, body: LocalizedText, url?: string) {
  try {
    const recipients = await getFamilyRecipients(caregiverId)
    await Promise.all(
      recipients.map((r) =>
        sendNotification({ userId: r.userId, title, body, userLanguage: asLang(r.language), url }),
      ),
    )
    return recipients.length
  } catch (err) {
    console.error("[family-notify] Failed to notify family:", err)
    return 0
  }
}
