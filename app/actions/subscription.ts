"use server"

import { db } from "@/lib/db"
import { subscriptions } from "@/lib/db/schema"
import { getUserId } from "@/lib/auth-helpers"
import type { SubscriptionRow } from "@/lib/subscription"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getSubscription(): Promise<SubscriptionRow> {
  const userId = await getUserId()
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1)
  if (rows[0]) return rows[0]
  const [created] = await db
    .insert(subscriptions)
    .values({ userId, plan: "free", status: "inactive" })
    .returning()
  return created
}

export async function cancelPro() {
  const userId = await getUserId()
  await db
    .update(subscriptions)
    .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
    .where(eq(subscriptions.userId, userId))
  revalidatePath("/profile")
  revalidatePath("/billing")
  return { ok: true }
}
