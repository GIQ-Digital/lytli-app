import { ProfileClient } from "@/components/profile-client"
import { getSession } from "@/lib/auth-helpers"
import { getRecipient } from "@/app/actions/care"
import { getLatestCheckin } from "@/app/actions/wellness"
import { getFamily } from "@/app/actions/family"
import { getSubscription } from "@/app/actions/subscription"
import { isPro, FREE_FAMILY_SEATS, PRO_FAMILY_SEATS } from "@/lib/subscription"
import { getSessionUsage } from "@/app/actions/ask"

export default async function ProfilePage() {
  const [session, recipient, latest, family, sub, usage] = await Promise.all([
    getSession(),
    getRecipient(),
    getLatestCheckin(),
    getFamily(),
    getSubscription(),
    getSessionUsage(),
  ])

  const pro = isPro(sub)
  const caregiverName = session?.user?.name?.split(" ")[0] ?? "there"
  const conditions = (recipient?.conditions ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)

  return (
    <ProfileClient
      caregiverName={caregiverName}
      recipientName={recipient?.name ?? "—"}
      recipientAge={recipient?.age ?? null}
      relationship={recipient?.relationship ?? null}
      conditions={conditions}
      pro={pro}
      sessionsRemaining={usage.remaining}
      familySeats={pro ? PRO_FAMILY_SEATS : FREE_FAMILY_SEATS}
      familySeatsUsed={family.members.length + family.invites.length}
      latest={latest}
    />
  )
}
