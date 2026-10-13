import { and, eq, gte, isNull, lt } from "drizzle-orm"
import { start } from "workflow/api"
import { db } from "@/lib/db"
import { appointments, medications, notificationPrefs, notificationQueue } from "@/lib/db/schema"
import { parseTimes } from "@/lib/schedule"
import { deliverScheduledNotification } from "@/workflows/scheduled-notification"

export const DEFAULT_TIME_ZONE = "America/Sao_Paulo"
const DAY_MS = 24 * 60 * 60_000
const APPOINTMENT_LEAD_MS = 60 * 60_000
// A reminder queued a few seconds late is still delivered instead of dropped.
const GRACE_MS = 2 * 60_000

export type MedicationPayload = { medicationId: number; time: string; localDate: string }
export type AppointmentPayload = { appointmentId: number; startsAt: string }

export function resolveTimeZone(timeZone: string | null | undefined) {
  if (!timeZone) return DEFAULT_TIME_ZONE
  try {
    new Intl.DateTimeFormat("en-US", { timeZone })
    return timeZone
  } catch {
    return DEFAULT_TIME_ZONE
  }
}

function zonedParts(instant: Date, timeZone: string) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(instant)
      .map((p) => [p.type, p.value]),
  )
}

export function localDateKey(instant: Date, timeZone: string) {
  const p = zonedParts(instant, timeZone)
  return `${p.year}-${p.month}-${p.day}`
}

function offsetMs(instant: Date, timeZone: string) {
  const p = zonedParts(instant, timeZone)
  const wallClockAsUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second)
  return wallClockAsUtc - Math.floor(instant.getTime() / 1000) * 1000
}

/** Converts a wall-clock date and time in a time zone to the matching UTC instant. */
export function zonedTimeToUtc(date: string, time: string, timeZone: string) {
  const [y, m, d] = date.split("-").map(Number)
  const [h, min] = time.split(":").map(Number)
  const wallClock = Date.UTC(y, m - 1, d, h ?? 0, min ?? 0)
  const first = wallClock - offsetMs(new Date(wallClock), timeZone)
  // Second pass corrects the offset when a DST change falls between the two instants.
  return new Date(wallClock - offsetMs(new Date(first), timeZone))
}

type QueueRow = typeof notificationQueue.$inferInsert

async function buildUserReminders(userId: string, now: Date): Promise<QueueRow[]> {
  const [pref] = await db
    .select({ timeZone: notificationPrefs.timeZone })
    .from(notificationPrefs)
    .where(eq(notificationPrefs.userId, userId))
    .limit(1)
  const timeZone = resolveTimeZone(pref?.timeZone)
  const from = now.getTime() - GRACE_MS
  const until = now.getTime() + DAY_MS
  const rows: QueueRow[] = []

  const meds = await db
    .select({ id: medications.id, times: medications.times })
    .from(medications)
    .where(and(eq(medications.userId, userId), eq(medications.active, true)))

  const dates = [...new Set([localDateKey(now, timeZone), localDateKey(new Date(until), timeZone)])]
  for (const med of meds) {
    for (const localDate of dates) {
      for (const time of parseTimes(med.times)) {
        const at = zonedTimeToUtc(localDate, time, timeZone)
        if (at.getTime() < from || at.getTime() >= until) continue
        const payload: MedicationPayload = { medicationId: med.id, time, localDate }
        rows.push({
          userId,
          type: "medication",
          dedupeKey: `med:${med.id}:${localDate}:${time}`,
          scheduledAt: at,
          payload,
        })
      }
    }
  }

  const appts = await db
    .select({ id: appointments.id, startsAt: appointments.startsAt })
    .from(appointments)
    .where(
      and(
        eq(appointments.userId, userId),
        gte(appointments.startsAt, new Date(from + APPOINTMENT_LEAD_MS)),
        lt(appointments.startsAt, new Date(until + APPOINTMENT_LEAD_MS)),
      ),
    )

  for (const appt of appts) {
    const payload: AppointmentPayload = { appointmentId: appt.id, startsAt: appt.startsAt.toISOString() }
    rows.push({
      userId,
      type: "appointment",
      dedupeKey: `appt:${appt.id}:${appt.startsAt.toISOString()}`,
      scheduledAt: new Date(appt.startsAt.getTime() - APPOINTMENT_LEAD_MS),
      payload,
    })
  }

  return rows
}

/** Starts a delivery workflow for every queued reminder that does not have one yet. */
async function startPendingDeliveries(userId: string, now: Date) {
  const pending = await db
    .select({ id: notificationQueue.id, scheduledAt: notificationQueue.scheduledAt })
    .from(notificationQueue)
    .where(
      and(
        eq(notificationQueue.userId, userId),
        eq(notificationQueue.sent, false),
        isNull(notificationQueue.runId),
        gte(notificationQueue.scheduledAt, new Date(now.getTime() - GRACE_MS)),
      ),
    )

  let started = 0
  for (const row of pending) {
    try {
      const run = await start(deliverScheduledNotification, [row.id, row.scheduledAt.toISOString()])
      await db.update(notificationQueue).set({ runId: run.runId }).where(eq(notificationQueue.id, row.id))
      started++
    } catch (err) {
      console.error("[notification-queue] Failed to start delivery:", row.id, err)
    }
  }
  return started
}

/** Queues the user's medication and appointment reminders for the next 24 hours. Safe to call repeatedly. */
export async function queueUpcomingForUser(userId: string, now = new Date()) {
  const rows = await buildUserReminders(userId, now)
  if (rows.length > 0) {
    await db.insert(notificationQueue).values(rows).onConflictDoNothing({ target: notificationQueue.dedupeKey })
  }
  const scheduled = await startPendingDeliveries(userId, now)
  return { reminders: rows.length, scheduled }
}

export async function queueUpcomingForAllUsers(now = new Date()) {
  const [medUsers, apptUsers] = await Promise.all([
    db.selectDistinct({ userId: medications.userId }).from(medications).where(eq(medications.active, true)),
    db
      .selectDistinct({ userId: appointments.userId })
      .from(appointments)
      .where(
        and(
          gte(appointments.startsAt, now),
          lt(appointments.startsAt, new Date(now.getTime() + DAY_MS + APPOINTMENT_LEAD_MS)),
        ),
      ),
  ])
  const userIds = [...new Set([...medUsers, ...apptUsers].map((r) => r.userId))]

  let reminders = 0
  let scheduled = 0
  let failedUsers = 0
  for (const userId of userIds) {
    try {
      const result = await queueUpcomingForUser(userId, now)
      reminders += result.reminders
      scheduled += result.scheduled
    } catch (err) {
      failedUsers++
      console.error("[notification-queue] Failed to queue reminders for user:", userId, err)
    }
  }
  return { users: userIds.length, reminders, scheduled, failedUsers }
}
