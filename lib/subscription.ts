import type { subscriptions } from "@/lib/db/schema"

export type SubscriptionRow = typeof subscriptions.$inferSelect

export const FREE_SESSION_LIMIT = 5
export const FREE_FAMILY_SEATS = 2
export const PRO_FAMILY_SEATS = 6

export function isPro(sub: Pick<SubscriptionRow, "plan" | "status">) {
  return sub.plan === "pro" && (sub.status === "active" || sub.status === "trialing")
}
