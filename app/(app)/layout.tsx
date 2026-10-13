import { redirect } from "next/navigation"
import { getCurrentUser, getPrimaryRecipient } from "@/lib/auth-helpers"
import { EmergencyBanner } from "@/components/emergency-banner"
import { MedicalDisclaimerBar } from "@/components/medical-disclaimer"
import { BottomNav } from "@/components/bottom-nav"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const recipient = await getPrimaryRecipient(user.id)
  if (!recipient) redirect("/onboarding")

  return (
    <div className="flex min-h-screen flex-col">
      <EmergencyBanner />
      <MedicalDisclaimerBar />
      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
      <BottomNav />
    </div>
  )
}
