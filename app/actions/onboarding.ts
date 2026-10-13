"use server"

import { db } from "@/lib/db"
import { careRecipient, subscriptions } from "@/lib/db/schema"
import { getUserId, getPrimaryRecipient } from "@/lib/auth-helpers"
import { eq } from "drizzle-orm"

export async function completeOnboarding(input: {
  name: string
  age?: string
  relationship?: string
  challenge?: string
}) {
  const userId = await getUserId()

  const existing = await getPrimaryRecipient(userId)
  if (existing) {
    await db
      .update(careRecipient)
      .set({
        name: input.name.trim(),
        age: input.age ? Number(input.age) : null,
        relationship: input.relationship ?? null,
        notes: input.challenge ?? null,
      })
      .where(eq(careRecipient.id, existing.id))
  } else {
    await db.insert(careRecipient).values({
      userId,
      name: input.name.trim(),
      age: input.age ? Number(input.age) : null,
      relationship: input.relationship ?? null,
      notes: input.challenge ?? null,
      isPrimary: true,
    })
  }

  // Ensure a subscription row exists (free plan by default)
  const sub = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1)
  if (sub.length === 0) {
    await db.insert(subscriptions).values({ userId, plan: "free", status: "inactive" })
  }

  return { ok: true }
}
