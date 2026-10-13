import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser, getPrimaryRecipient } from "@/lib/auth-helpers"
import { LoginForm } from "@/components/login-form"
import { inviteAcceptPath } from "@/lib/invite"

type SearchParams = Promise<{ invite?: string | string[] }>

function readInvite(value: string | string[] | undefined) {
  const code = (Array.isArray(value) ? value[0] : value)?.trim().toUpperCase()
  return code && /^[A-Z0-9]{4,32}$/.test(code) ? code : null
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const invite = readInvite((await searchParams).invite)
  if (!invite) return {}
  const title = "You've been invited to Lytli"
  const description = "Join your family's care network on Lytli. Caregiving made lighter."
  return {
    title,
    description,
    openGraph: { title, description, siteName: "Lytli", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const invite = readInvite((await searchParams).invite)
  const user = await getCurrentUser()
  if (user) {
    if (invite) redirect(inviteAcceptPath(invite))
    const recipient = await getPrimaryRecipient(user.id)
    redirect(recipient ? "/home" : "/onboarding")
  }
  return <LoginForm invite={invite} />
}
