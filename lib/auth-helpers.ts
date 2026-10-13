import "server-only"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { careRecipient } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

export async function getUserId() {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")
  return user.id
}

export async function getPrimaryRecipient(userId: string) {
  const rows = await db
    .select()
    .from(careRecipient)
    .where(eq(careRecipient.userId, userId))
    .limit(1)
  return rows[0] ?? null
}
