import { NextResponse, type NextRequest } from "next/server"
import { and, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { familyInvites, familyMembers } from "@/lib/db/schema"
import { INVITE_COOKIE } from "@/lib/invite"

const INVITE_CODE = /^[A-Z0-9]{4,32}$/

// Relative Location keeps the browser's own origin; request.url can carry the wrong protocol behind the preview proxy.
function redirectTo(path: string) {
  return new NextResponse(null, { status: 307, headers: { Location: path } })
}

export async function GET(request: NextRequest) {
  const fromQuery = request.nextUrl.searchParams.get("code")
  const fromCookie = request.cookies.get(INVITE_COOKIE)?.value
  const code = (fromQuery || fromCookie || "").trim().toUpperCase()

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return redirectTo(INVITE_CODE.test(code) ? `/login?invite=${encodeURIComponent(code)}` : "/login")
  }

  const response = redirectTo("/home")
  response.cookies.delete(INVITE_COOKIE)

  if (!INVITE_CODE.test(code)) return response

  const user = session.user
  const [invite] = await db.select().from(familyInvites).where(eq(familyInvites.code, code)).limit(1)

  if (!invite || invite.status !== "pending" || invite.userId === user.id) return response

  const email = user.email.toLowerCase()
  const [existing] = await db
    .select({ id: familyMembers.id })
    .from(familyMembers)
    .where(and(eq(familyMembers.userId, invite.userId), eq(familyMembers.email, email)))
    .limit(1)

  if (!existing) {
    await db.insert(familyMembers).values({
      userId: invite.userId,
      name: invite.name?.trim() || user.name || email.split("@")[0],
      email,
      role: invite.role === "caregiver" ? "caregiver" : "viewer",
      status: "active",
    })
  }

  await db
    .update(familyInvites)
    .set({ status: "accepted" })
    .where(and(eq(familyInvites.id, invite.id), eq(familyInvites.status, "pending")))

  return response
}
