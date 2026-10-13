import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { pushSubscriptions } from "@/lib/db/schema"
import { getCurrentUser } from "@/lib/auth-helpers"

type IncomingSubscription = {
  endpoint?: unknown
  keys?: { p256dh?: unknown; auth?: unknown }
}

function parseSubscription(body: unknown) {
  const sub = (body as { subscription?: IncomingSubscription })?.subscription ?? (body as IncomingSubscription)
  const endpoint = sub?.endpoint
  const p256dh = sub?.keys?.p256dh
  const auth = sub?.keys?.auth
  if (
    typeof endpoint !== "string" ||
    !endpoint.startsWith("https://") ||
    endpoint.length > 2048 ||
    typeof p256dh !== "string" ||
    p256dh.length > 512 ||
    typeof auth !== "string" ||
    auth.length > 512
  ) {
    return null
  }
  return { endpoint, p256dh, auth }
}

/** Returns the VAPID public key the browser needs to create a subscription. */
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const publicKey = process.env.VAPID_PUBLIC_KEY
  if (!publicKey) return NextResponse.json({ error: "Push not configured" }, { status: 503 })
  return NextResponse.json({ publicKey })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = parseSubscription(await request.json().catch(() => null))
  if (!parsed) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 })

  await db
    .insert(pushSubscriptions)
    .values({ userId: user.id, ...parsed })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId: user.id, p256dh: parsed.p256dh, auth: parsed.auth },
    })

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = (await request.json().catch(() => null)) as { endpoint?: unknown } | null
  if (typeof body?.endpoint !== "string") {
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 })
  }

  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, user.id), eq(pushSubscriptions.endpoint, body.endpoint)))

  return NextResponse.json({ ok: true })
}
