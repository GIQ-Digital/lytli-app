import { redirect } from "next/navigation"
import { getCurrentUser, getPrimaryRecipient } from "@/lib/auth-helpers"

export default async function RootPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const recipient = await getPrimaryRecipient(user.id)
  redirect(recipient ? "/home" : "/onboarding")
}
