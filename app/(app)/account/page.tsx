import { AccountClient } from "@/components/account-client"
import { getSession } from "@/lib/auth-helpers"
import { getSubscription } from "@/app/actions/subscription"
import { isPro } from "@/lib/subscription"
import { getFamilyUpdatesEnabled } from "@/app/actions/notification-prefs"

const DAY_MS = 24 * 60 * 60 * 1000

export default async function AccountPage() {
  const [session, sub, familyUpdates] = await Promise.all([
    getSession(),
    getSubscription(),
    getFamilyUpdatesEnabled(),
  ])

  const pro = isPro(sub)
  const trialing = pro && sub.status === "trialing"
  const trialDaysLeft =
    trialing && sub.currentPeriodEnd
      ? Math.max(0, Math.ceil((sub.currentPeriodEnd.getTime() - Date.now()) / DAY_MS))
      : null

  return (
    <AccountClient
      name={session?.user?.name ?? ""}
      email={session?.user?.email ?? ""}
      plan={trialing ? "trial" : pro ? "pro" : "free"}
      trialDaysLeft={trialDaysLeft}
      cancelAtPeriodEnd={sub.cancelAtPeriodEnd}
      canCancel={pro && Boolean(sub.stripeSubscriptionId)}
      familyUpdates={familyUpdates}
    />
  )
}
