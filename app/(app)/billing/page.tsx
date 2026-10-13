import { getSubscription } from "@/app/actions/subscription"
import { getRequestRegion } from "@/app/actions/stripe"
import { BillingClient } from "@/components/billing-client"

export default async function BillingPage() {
  const [subscription, { region }] = await Promise.all([getSubscription(), getRequestRegion()])
  return (
    <BillingClient
      region={region}
      subscription={{
        plan: subscription.plan === "pro" ? "pro" : "free",
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        currentPeriodEnd: subscription.currentPeriodEnd ? subscription.currentPeriodEnd.toISOString() : null,
      }}
    />
  )
}
