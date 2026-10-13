import { NextResponse, type NextRequest } from "next/server"
import { and, eq, gte, inArray, lte } from "drizzle-orm"
import { db } from "@/lib/db"
import { appointments, medLogs, medications, notificationLog, notificationPrefs } from "@/lib/db/schema"
import { sendNotification } from "@/lib/notify"
import { asLang } from "@/lib/family-notify"
import { parseTimes } from "@/lib/schedule"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const DEFAULT_TIME_ZONE = "America/Sao_Paulo"
const MED_WINDOW_MINUTES = 5

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === "development"
  return request.headers.get("authorization") === `Bearer ${secret}`
}

function localNow(timeZone: string, now: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  )
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  }
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map((n) => Number.parseInt(n, 10))
  return (h ?? 0) * 60 + (m ?? 0)
}

/** Records the reminder as sent; returns false when it was already sent. */
async function claim(key: string) {
  const rows = await db.insert(notificationLog).values({ key }).onConflictDoNothing().returning()
  return rows.length > 0
}

async function loadPrefs(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, { language: string; timeZone: string | null }>()
  const rows = await db
    .select({ userId: notificationPrefs.userId, language: notificationPrefs.language, timeZone: notificationPrefs.timeZone })
    .from(notificationPrefs)
    .where(inArray(notificationPrefs.userId, userIds))
  return new Map(rows.map((r) => [r.userId, r]))
}

async function sendMedicationReminders(now: Date) {
  const meds = await db
    .select({ id: medications.id, userId: medications.userId, name: medications.name, dosage: medications.dosage, times: medications.times })
    .from(medications)
    .where(eq(medications.active, true))

  const prefs = await loadPrefs([...new Set(meds.map((m) => m.userId))])
  const utcDate = now.toISOString().slice(0, 10)
  let sent = 0

  for (const med of meds) {
    const pref = prefs.get(med.userId)
    const local = localNow(pref?.timeZone || DEFAULT_TIME_ZONE, now)

    for (const time of parseTimes(med.times)) {
      const diff = toMinutes(time) - local.minutes
      if (diff < 0 || diff > MED_WINDOW_MINUTES) continue

      const keys = [...new Set([`${local.date} ${time}`, `${utcDate} ${time}`])]
      const done = await db
        .select({ id: medLogs.id })
        .from(medLogs)
        .where(and(eq(medLogs.userId, med.userId), eq(medLogs.medicationId, med.id), inArray(medLogs.scheduledFor, keys), eq(medLogs.status, "taken")))
        .limit(1)
      if (done.length > 0) continue
      if (!(await claim(`med:${med.id}:${local.date}:${time}`))) continue

      const detail = `${med.name}${med.dosage ? ` (${med.dosage})` : ""} — ${time}`
      await sendNotification({
        userId: med.userId,
        title: { pt: "Hora do remédio", en: "Medication time", es: "Hora del medicamento" },
        body: { pt: detail, en: detail, es: detail },
        userLanguage: asLang(pref?.language),
        url: "/medications",
      })
      sent++
    }
  }
  return sent
}

async function sendAppointmentReminders(now: Date) {
  const from = new Date(now.getTime() + 55 * 60_000)
  const to = new Date(now.getTime() + 65 * 60_000)
  const rows = await db
    .select()
    .from(appointments)
    .where(and(gte(appointments.startsAt, from), lte(appointments.startsAt, to)))

  const prefs = await loadPrefs([...new Set(rows.map((a) => a.userId))])
  let sent = 0

  for (const appt of rows) {
    if (!(await claim(`appt:${appt.id}:${appt.startsAt.toISOString()}`))) continue
    const pref = prefs.get(appt.userId)
    const lang = asLang(pref?.language)
    const locale = lang === "pt" ? "pt-BR" : lang === "es" ? "es" : "en-US"
    const time = appt.startsAt.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: pref?.timeZone || DEFAULT_TIME_ZONE,
    })
    const detail = [appt.title, time, appt.location].filter(Boolean).join(" · ")

    await sendNotification({
      userId: appt.userId,
      title: { pt: "Consulta em 1 hora", en: "Appointment in 1 hour", es: "Cita en 1 hora" },
      body: { pt: detail, en: detail, es: detail },
      userLanguage: lang,
      url: "/schedule",
    })
    sent++
  }
  return sent
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const now = new Date()
  try {
    const [medicationReminders, appointmentReminders] = await Promise.all([
      sendMedicationReminders(now),
      sendAppointmentReminders(now),
    ])
    return NextResponse.json({ ok: true, medicationReminders, appointmentReminders })
  } catch (err) {
    console.error("[cron/notifications] Failed:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
