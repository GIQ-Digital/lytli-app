import { redirect } from "next/navigation"
import { getCurrentUser, getPrimaryRecipient } from "@/lib/auth-helpers"
import { OnboardingForm } from "@/components/onboarding-form"

export default async function OnboardingPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const recipient = await getPrimaryRecipient(user.id)
  if (recipient) redirect("/home")
  return <OnboardingForm />
}
