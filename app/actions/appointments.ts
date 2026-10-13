"use server"

import { db } from "@/lib/db"
import { appointments } from "@/lib/db/schema"
import { getUserId } from "@/lib/auth-helpers"
import { and, eq, gte, asc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type AppointmentRow = typeof appointments.$inferSelect

export async function getAppointments(): Promise<AppointmentRow[]> {
  const userId = await getUserId()
  return db
    .select()
    .from(appointments)
    .where(eq(appointments.userId, userId))
    .orderBy(asc(appointments.startsAt))
}

export async function getUpcomingAppointments(): Promise<AppointmentRow[]> {
  const userId = await getUserId()
  const now = new Date()
  return db
    .select()
    .from(appointments)
    .where(and(eq(appointments.userId, userId), gte(appointments.startsAt, now)))
    .orderBy(asc(appointments.startsAt))
}

export async function addAppointment(input: {
  title: string
  doctor?: string
  location?: string
  startsAt: string // ISO datetime-local
  reminderMinutes?: number
  notes?: string
}) {
  const userId = await getUserId()
  if (!input.title?.trim()) throw new Error("Title required")
  if (!input.startsAt) throw new Error("Date required")
  await db.insert(appointments).values({
    userId,
    title: input.title.trim(),
    doctor: input.doctor?.trim() || null,
    location: input.location?.trim() || null,
    startsAt: new Date(input.startsAt),
    reminderMinutes: input.reminderMinutes ?? 60,
    notes: input.notes?.trim() || null,
  })
  revalidatePath("/schedule")
  revalidatePath("/home")
  return { ok: true }
}

export async function deleteAppointment(id: number) {
  const userId = await getUserId()
  await db.delete(appointments).where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
  revalidatePath("/schedule")
  revalidatePath("/home")
  return { ok: true }
}
