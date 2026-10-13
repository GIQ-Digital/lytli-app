import { FamilyClient } from "@/components/family-client"
import { getFamily } from "@/app/actions/family"
import { getRecipient } from "@/app/actions/care"

export default async function FamilyPage() {
  const [{ members, invites }, recipient] = await Promise.all([getFamily(), getRecipient()])
  return <FamilyClient recipientName={recipient?.name ?? "—"} members={members} invites={invites} />
}
