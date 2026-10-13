"use server"

import { headers } from "next/headers"
import { stripe, getPriceIdForRegion } from "@/lib/stripe"
import { getRegionForCountry, TRIAL_DAYS } from "@/lib/pricing"
import { db } from "@/lib/db"
import { subscriptions } from "@/lib/db/schema"
import { getSession, getUserId } from "@/lib/auth-helpers"
import { revalidatePath } from "next/cache"

/** Region is derived server-side from Vercel's geo header so clients can't pick a cheaper price. */
export async function getRequestRegion() {
  const country = (await headers()).get("x-vercel-ip-country")
  return { country, region: getRegionForCountry(country) }
}

/** Start an embedded Checkout session for the Lytli Pro monthly subscription. */
export async function startProCheckout() {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")

  const { country, region } = await getRequestRegion()
  const priceId = getPriceIdForRegion(region)

  const checkout = await stripe.checkout.sessions.create({
    ui_mode: "embedded_page",
    redirect_on_completion: "never",
    mode: "subscription",
    customer_email: session.user.email ?? undefined,
    client_reference_id: session.user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { userId: session.user.id, region },
    },
    metadata: { userId: session.user.id, region, country: country ?? "unknown" },
  })

  return { clientSecret: checkout.client_secret, sessionId: checkout.id }
}

/**
 * Verify a completed Checkout session server-side and activate the Pro plan.
 * Called from the client once the embedded checkout reports completion.
 */
export async function confirmProCheckout(sessionId: string) {
  const userId = await getUserId()
  const checkout = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  })

  // Only trust a paid session that belongs to this user.
  if (checkout.client_reference_id !== userId) throw new Error("Session mismatch")
  // Trials complete with payment_status "no_payment_required", so status is the source of truth.
  if (checkout.status !== "complete") {
    return { ok: false as const }
  }

  const sub = typeof checkout.subscription === "object" ? checkout.subscription : null
  const periodEnd = sub?.trial_end ?? sub?.items?.data?.[0]?.current_period_end ?? null
  const status = sub?.status ?? "active"

  await db
    .insert(subscriptions)
    .values({
      userId,
      plan: "pro",
      status,
      stripeCustomerId: typeof checkout.customer === "string" ? checkout.customer : (checkout.customer?.id ?? null),
      stripeSubscriptionId: sub?.id ?? (typeof checkout.subscription === "string" ? checkout.subscription : null),
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        plan: "pro",
        status,
        stripeCustomerId: typeof checkout.customer === "string" ? checkout.customer : (checkout.customer?.id ?? null),
        stripeSubscriptionId: sub?.id ?? (typeof checkout.subscription === "string" ? checkout.subscription : null),
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      },
    })

  revalidatePath("/billing")
  revalidatePath("/profile")
  revalidatePath("/ask")
  return { ok: true as const }
}
