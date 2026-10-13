"use server"

import { db } from "@/lib/db"
import { wellnessCheckins } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

function clamp(n: number) {
  if (Number.isNaN(n)) return 3
  return Math.min(5, Math.max(1, Math.round(n)))
}

export async function getLatestCheckin() {
  const userId = await getUserId()
  const [latest] = await db
    .select()
    .from(wellnessCheckins)
    .where(eq(wellnessCheckins.userId, userId))
    .orderBy(desc(wellnessCheckins.createdAt))
    .limit(1)
  return latest ?? null
}

export async function saveCheckin(input: { mood: number; energy: number; stress: number; sleep: number; note?: string }) {
  const userId = await getUserId()
  const [row] = await db
    .insert(wellnessCheckins)
    .values({
      userId,
      mood: clamp(input.mood),
      energy: clamp(input.energy),
      stress: clamp(input.stress),
      sleep: clamp(input.sleep),
      note: input.note?.trim() || null,
    })
    .returning()
  revalidatePath("/family")
  revalidatePath("/home")
  return row
}
