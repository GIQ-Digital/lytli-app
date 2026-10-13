"use server"

import { db } from "@/lib/db"
import { tasks } from "@/lib/db/schema"
import { getUserId } from "@/lib/auth-helpers"
import { and, eq, asc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type TaskRow = typeof tasks.$inferSelect

export async function getTasks(): Promise<TaskRow[]> {
  const userId = await getUserId()
  return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(asc(tasks.createdAt))
}

export async function addTask(input: { title: string; dueAt?: string }) {
  const userId = await getUserId()
  if (!input.title?.trim()) throw new Error("Title required")
  await db.insert(tasks).values({
    userId,
    title: input.title.trim(),
    dueAt: input.dueAt ? new Date(input.dueAt) : null,
  })
  revalidatePath("/home")
  return { ok: true }
}

export async function toggleTask(id: number, completed: boolean) {
  const userId = await getUserId()
  await db.update(tasks).set({ completed }).where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  revalidatePath("/home")
  return { ok: true }
}

export async function deleteTask(id: number) {
  const userId = await getUserId()
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  revalidatePath("/home")
  return { ok: true }
}
