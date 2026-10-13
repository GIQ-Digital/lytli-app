import { and, eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { appointments, medLogs, medications, notificationPrefs, notificationQueue } from "@/lib/db/schema"
import { sendNotification, type LocalizedText } from "@/lib/notify"
import { asLang, type NotifyLang } from "@/lib/family-notify"
import { parseTimes } from "@/lib/schedule"
import { resolveTimeZone, type AppointmentPayload, type MedicationPayload } from "@/lib/notification-queue"

type Message = { title: LocalizedText; body: LocalizedText; url: string }
type QueueEntry = typeof notificationQueue.$inferSelect

async function medicationMessage(entry: QueueEntry): Promise<Message | null> {
  const { medicationId, time, localDate } = entry.payload as MedicationPayload
  const [med] = await db
    .select()
    .from(medications)
    .where(and(eq(medications.id, medicationId), eq(medications.userId, entry.userId)))
    .limit(1)
  if (!med || !med.active || !parseTimes(med.times).includes(time)) return null

  const keys = [...new Set([`${localDate} ${time}`, `${entry.scheduledAt.toISOString().slice(0, 10)} ${time}`])]
  const taken = await db
    .select({ id: medLogs.id })
    .from(medLogs)
    .where(
      and(
        eq(medLogs.userId, entry.userId),
        eq(medLogs.medicationId, med.id),
        inArray(medLogs.scheduledFor, keys),
        eq(medLogs.status, "taken"),
      ),
    )
    .limit(1)
  if (taken.length > 0) return null

  const detail = `${med.name}${med.dosage ? ` (${med.dosage})` : ""} — ${time}`
  return {
    title: { pt: "Hora do remédio", en: "Medication time", es: "Hora del medicamento" },
    body: { pt: detail, en: detail, es: detail },
    url: "/medications",
  }
}

async function appointmentMessage(entry: QueueEntry, lang: NotifyLang, timeZone: string): Promise<Message | null> {
  const { appointmentId, startsAt } = entry.payload as AppointmentPayload
  const [appt] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.id, appointmentId), eq(appointments.userId, entry.userId)))
    .limit(1)
  if (!appt || appt.startsAt.toISOString() !== startsAt) return null

  const locale = lang === "pt" ? "pt-BR" : lang === "es" ? "es" : "en-US"
  const time = appt.startsAt.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", timeZone })
  const detail = [appt.title, time, appt.location].filter(Boolean).join(" · ")
  return {
    title: { pt: "Consulta em 1 hora", en: "Appointment in 1 hour", es: "Cita en 1 hora" },
    body: { pt: detail, en: detail, es: detail },
    url: "/schedule",
  }
}

/**
 * Sends one queued reminder. Re-checks the medication or appointment first, so a dose
 * already marked as taken, an edited time or a deleted entry is skipped instead of sent.
 */
export async function deliverQueuedNotification(queueId: number) {
  "use step"

  const [entry] = await db.select().from(notificationQueue).where(eq(notificationQueue.id, queueId)).limit(1)
  if (!entry || entry.sent) return { status: "already-handled" as const }

  const [pref] = await db
    .select({ language: notificationPrefs.language, timeZone: notificationPrefs.timeZone })
    .from(notificationPrefs)
    .where(eq(notificationPrefs.userId, entry.userId))
    .limit(1)
  const lang = asLang(pref?.language)
  const timeZone = resolveTimeZone(pref?.timeZone)

  const message =
    entry.type === "medication" ? await medicationMessage(entry) : await appointmentMessage(entry, lang, timeZone)

  // Claim the row before sending so a retried step can never push the same reminder twice.
  const claimed = await db
    .update(notificationQueue)
    .set({ sent: true, sentAt: new Date(), outcome: message ? null : "skipped" })
    .where(and(eq(notificationQueue.id, queueId), eq(notificationQueue.sent, false)))
    .returning({ id: notificationQueue.id })
  if (claimed.length === 0) return { status: "already-handled" as const }
  if (!message) return { status: "skipped" as const }

  const { channel } = await sendNotification({
    userId: entry.userId,
    title: message.title,
    body: message.body,
    userLanguage: lang,
    url: message.url,
  })
  await db.update(notificationQueue).set({ outcome: channel }).where(eq(notificationQueue.id, queueId))
  return { status: "sent" as const, channel }
}
