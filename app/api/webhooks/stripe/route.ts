import type Stripe from "stripe"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe"
import { db } from "@/lib/db"
import { subscriptions } from "@/lib/db/schema"

// Stripe signs the raw body, so this must run on Node and never be cached.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const PRO_STATUSES = new Set<Stripe.Subscription.Status>(["active", "trialing", "past_due"])

function idOf(value: string | { id: string } | null | undefined) {
  if (!value) return null
  return typeof value === "string" ? value : value.id
}

function periodEndOf(sub: Stripe.Subscription) {
  const end = sub.trial_end ?? sub.items?.data?.[0]?.current_period_end ?? null
  return end ? new Date(end * 1000) : null
}

/** Updates the row matched by Stripe subscription ID, falling back to the userId stored in metadata at checkout. */
async function updateBySubscription(
  sub: Stripe.Subscription,
  values: Partial<typeof subscriptions.$inferInsert>,
) {
  const set = { ...values, updatedAt: new Date() }

  const updated = await db
    .update(subscriptions)
    .set(set)
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
    .returning({ id: subscriptions.id })

  if (updated.length > 0) return

  const userId = sub.metadata?.userId
  if (!userId) {
    console.log("[stripe-webhook] No matching user for subscription", sub.id)
    return
  }

  await db
    .insert(subscriptions)
    .values({
      userId,
      plan: values.plan ?? "free",
      status: values.status ?? "inactive",
      ...set,
      stripeSubscriptionId: sub.id,
      stripeCustomerId: idOf(sub.customer),
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: { ...set, stripeSubscriptionId: sub.id, stripeCustomerId: idOf(sub.customer) },
    })
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  await updateBySubscription(sub, {
    plan: PRO_STATUSES.has(sub.status) ? "pro" : "free",
    status: sub.status,
    currentPeriodEnd: periodEndOf(sub),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  })
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  await updateBySubscription(sub, {
    plan: "free",
    status: "canceled",
    cancelAtPeriodEnd: false,
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Newer API versions moved the subscription reference under `parent`.
  const legacy = invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }
  const subscriptionId =
    idOf(invoice.parent?.subscription_details?.subscription) ?? idOf(legacy.subscription)

  if (!subscriptionId) return

  await db
    .update(subscriptions)
    .set({ status: "past_due", updatedAt: new Date() })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature")
  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing signature or webhook secret", { status: 400 })
  }

  let event: Stripe.Event
  try {
    const body = await request.text()
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.log("[stripe-webhook] Signature verification failed:", (err as Error).message)
    return new Response("Invalid signature", { status: 400 })
  }

  try {
    switch (event.type) {
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object)
        break
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object)
        break
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object)
        break
      default:
        break
    }
  } catch (err) {
    // A 500 makes Stripe retry the delivery, so a transient DB error doesn't lose the event.
    console.log("[stripe-webhook] Handler failed for", event.type, (err as Error).message)
    return new Response("Webhook handler failed", { status: 500 })
  }

  revalidatePath("/billing")
  revalidatePath("/profile")
  revalidatePath("/ask")

  return Response.json({ received: true })
}
