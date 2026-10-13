"use server"

import { db } from "@/lib/db"
import { familyMembers, familyInvites } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { sendInviteEmail, normalizeLang } from "@/lib/invite-email"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

function makeCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function getFamily() {
  const userId = await getUserId()
  const [members, invites] = await Promise.all([
    db.select().from(familyMembers).where(eq(familyMembers.userId, userId)).orderBy(desc(familyMembers.createdAt)),
    db
      .select()
      .from(familyInvites)
      .where(and(eq(familyInvites.userId, userId), eq(familyInvites.status, "pending")))
      .orderBy(desc(familyInvites.createdAt)),
  ])
  return { members, invites }
}

async function appOrigin() {
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  if (host) {
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
    return `${proto}://${host}`
  }
  return process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : ""
}

export async function inviteFamily(input: { name: string; email?: string; role?: string; lang?: string }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  const userId = session.user.id
  const name = input.name.trim()
  if (!name) throw new Error("Name required")
  const code = makeCode()
  const [invite] = await db
    .insert(familyInvites)
    .values({
      userId,
      code,
      name,
      email: input.email?.trim() || null,
      role: input.role === "caregiver" ? "caregiver" : "viewer",
      status: "pending",
    })
    .returning()

  if (invite.email) {
    try {
      await sendInviteEmail({
        to: invite.email,
        inviteUrl: `${await appOrigin()}/login?invite=${invite.code}`,
        inviterName: session.user.name || session.user.email,
        lang: normalizeLang(input.lang),
      })
    } catch (err) {
      console.error("[family] Failed to send invite email:", err)
    }
  }

  revalidatePath("/family")
  return invite
}

export async function cancelInvite(id: number) {
  const userId = await getUserId()
  await db.delete(familyInvites).where(and(eq(familyInvites.id, id), eq(familyInvites.userId, userId)))
  revalidatePath("/family")
}

export async function removeFamilyMember(id: number) {
  const userId = await getUserId()
  await db.delete(familyMembers).where(and(eq(familyMembers.id, id), eq(familyMembers.userId, userId)))
  revalidatePath("/family")
}
