import { NextResponse, type NextRequest } from "next/server"
import { queueUpcomingForAllUsers } from "@/lib/notification-queue"

export const dynamic = "force-dynamic"
export const maxDuration = 60

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === "development"
  return request.headers.get("authorization") === `Bearer ${secret}`
}

/**
 * Runs once a day. Queues every medication and appointment reminder due in the next
 * 24 hours; each one is delivered at its exact time by a durable workflow.
 */
export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const result = await queueUpcomingForAllUsers()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("[cron/notifications] Failed:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
