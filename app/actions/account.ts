"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { subscriptions } from "@/lib/db/schema"
import { getUserId } from "@/lib/auth-helpers"
import { stripe } from "@/lib/stripe"
import { isPro } from "@/lib/subscription"

export async function cancelSubscriptionAtPeriodEnd(): Promise<{ ok: boolean }> {
  const userId = await getUserId()
  const [row] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1)

  if (!row || !isPro(row) || !row.stripeSubscriptionId) return { ok: false }

  try {
    const updated = await stripe.subscriptions.update(row.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })
    await db
      .update(subscriptions)
      .set({ cancelAtPeriodEnd: updated.cancel_at_period_end, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId))
  } catch (err) {
    console.log("[account] Stripe cancel failed:", (err as Error).message)
    return { ok: false }
  }

  revalidatePath("/account")
  revalidatePath("/billing")
  revalidatePath("/profile")
  return { ok: true }
}
