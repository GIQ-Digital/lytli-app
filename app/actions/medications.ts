"use server"

import { db } from "@/lib/db"
import { medications, medLogs } from "@/lib/db/schema"
import { getUserId } from "@/lib/auth-helpers"
import { and, eq, gte } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { parseTimes, todayKey } from "@/lib/schedule"

export type MedRow = typeof medications.$inferSelect

export async function getMedications(): Promise<MedRow[]> {
  const userId = await getUserId()
  return db
    .select()
    .from(medications)
    .where(and(eq(medications.userId, userId), eq(medications.active, true)))
    .orderBy(medications.createdAt)
}

export async function addMedication(input: {
  name: string
  dosage?: string
  frequency?: string
  times?: string
  notes?: string
}) {
  const userId = await getUserId()
  if (!input.name?.trim()) throw new Error("Name required")
  await db.insert(medications).values({
    userId,
    name: input.name.trim(),
    dosage: input.dosage?.trim() || null,
    frequency: input.frequency?.trim() || null,
    times: input.times?.trim() || null,
    notes: input.notes?.trim() || null,
  })
  revalidatePath("/medications")
  revalidatePath("/home")
  revalidatePath("/schedule")
  return { ok: true }
}

export async function deleteMedication(id: number) {
  const userId = await getUserId()
  await db.update(medications).set({ active: false }).where(and(eq(medications.id, id), eq(medications.userId, userId)))
  revalidatePath("/medications")
  revalidatePath("/home")
  return { ok: true }
}

export async function updateMedication(
  id: number,
  input: { name: string; dosage?: string; frequency?: string; times?: string; notes?: string },
) {
  const userId = await getUserId()
  if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid id")
  if (!input.name?.trim()) throw new Error("Name required")
  await db
    .update(medications)
    .set({
      name: input.name.trim().slice(0, 120),
      dosage: input.dosage?.trim().slice(0, 60) || null,
      frequency: input.frequency?.trim().slice(0, 60) || null,
      times: input.times?.trim().slice(0, 200) || null,
      notes: input.notes?.trim().slice(0, 500) || null,
    })
    .where(and(eq(medications.id, id), eq(medications.userId, userId)))
  revalidatePath("/medications")
  revalidatePath("/home")
  revalidatePath("/schedule")
  return { ok: true }
}

export type DoseStatus = "pending" | "taken" | "missed"

/** Set today's status for one dose. "pending" removes the log row. */
export async function setDoseStatus(medicationId: number, time: string, status: DoseStatus) {
  const userId = await getUserId()
  if (!["pending", "taken", "missed"].includes(status)) throw new Error("Invalid status")
  if (!/^\d{1,2}:\d{2}$/.test(time)) throw new Error("Invalid time")

  const [med] = await db
    .select({ id: medications.id })
    .from(medications)
    .where(and(eq(medications.id, medicationId), eq(medications.userId, userId)))
    .limit(1)
  if (!med) throw new Error("Not found")

  const scheduledFor = `${todayKey()} ${time}`
  const match = and(
    eq(medLogs.userId, userId),
    eq(medLogs.medicationId, medicationId),
    eq(medLogs.scheduledFor, scheduledFor),
  )
  const existing = await db.select().from(medLogs).where(match).limit(1)

  if (status === "pending") {
    if (existing.length > 0) await db.delete(medLogs).where(match)
  } else if (existing.length > 0) {
    await db.update(medLogs).set({ status }).where(eq(medLogs.id, existing[0].id))
  } else {
    await db.insert(medLogs).values({ userId, medicationId, scheduledFor, status })
  }
  revalidatePath("/medications")
  revalidatePath("/home")
  return { ok: true }
}

/** Toggle a specific dose (medication at a given "HH:mm") as taken for today. */
export async function toggleDose(medicationId: number, time: string) {
  const userId = await getUserId()
  const scheduledFor = `${todayKey()} ${time}`
  const existing = await db
    .select()
    .from(medLogs)
    .where(
      and(
        eq(medLogs.userId, userId),
        eq(medLogs.medicationId, medicationId),
        eq(medLogs.scheduledFor, scheduledFor),
      ),
    )
    .limit(1)

  if (existing.length > 0 && existing[0].status !== "taken") {
    await db.update(medLogs).set({ status: "taken" }).where(eq(medLogs.id, existing[0].id))
  } else if (existing.length > 0) {
    await db.delete(medLogs).where(eq(medLogs.id, existing[0].id))
  } else {
    await db.insert(medLogs).values({ userId, medicationId, scheduledFor, status: "taken" })
  }
  revalidatePath("/medications")
  revalidatePath("/home")
  return { ok: true }
}

export type Dose = {
  medicationId: number
  name: string
  dosage: string | null
  note: string | null
  time: string
  taken: boolean
  status: DoseStatus
}

/** Build today's dose list from the user's medications + today's logs. */
export async function getTodaySchedule(): Promise<Dose[]> {
  const userId = await getUserId()
  const meds = await getMedications()
  const day = todayKey()

  const logs = await db
    .select()
    .from(medLogs)
    .where(and(eq(medLogs.userId, userId), gte(medLogs.scheduledFor, `${day} `)))

  const statusMap = new Map<string, DoseStatus>()
  for (const l of logs) {
    if (!l.scheduledFor.startsWith(day)) continue
    statusMap.set(`${l.medicationId}@${l.scheduledFor.split(" ")[1]}`, l.status === "missed" ? "missed" : "taken")
  }

  const doses: Dose[] = []
  for (const m of meds) {
    for (const time of parseTimes(m.times)) {
      const status = statusMap.get(`${m.id}@${time}`) ?? "pending"
      doses.push({
        medicationId: m.id,
        name: m.name,
        dosage: m.dosage,
        note: m.notes,
        time,
        taken: status === "taken",
        status,
      })
    }
  }
  doses.sort((a, b) => a.time.localeCompare(b.time))
  return doses
}

export async function getTodayAdherence(): Promise<number> {
  const doses = await getTodaySchedule()
  if (doses.length === 0) return 100
  const taken = doses.filter((d) => d.taken).length
  return Math.round((taken / doses.length) * 100)
}
