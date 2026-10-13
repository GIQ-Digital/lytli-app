"use server"

import { db } from "@/lib/db"
import { familyMembers, familyInvites } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

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

export async function inviteFamily(input: { name: string; email?: string; role?: string }) {
  const userId = await getUserId()
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
