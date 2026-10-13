import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-helpers"
import { queueUpcomingForUser } from "@/lib/notification-queue"

export const dynamic = "force-dynamic"

export async function POST() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const result = await queueUpcomingForUser(session.user.id)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("[notifications/schedule-today] Failed:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
