import { redirect } from "next/navigation"
import { getCurrentUser, getPrimaryRecipient } from "@/lib/auth-helpers"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) {
    const recipient = await getPrimaryRecipient(user.id)
    redirect(recipient ? "/home" : "/onboarding")
  }
  return <LoginForm />
}
