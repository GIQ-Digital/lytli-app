"use server"

import { db } from "@/lib/db"
import { careRecipient } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getRecipient() {
  const userId = await getUserId()
  const [row] = await db
    .select()
    .from(careRecipient)
    .where(eq(careRecipient.userId, userId))
    .orderBy(desc(careRecipient.isPrimary), desc(careRecipient.createdAt))
    .limit(1)
  return row ?? null
}
