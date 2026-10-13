import "server-only"

import Stripe from "stripe"
import type { PriceRegion } from "@/lib/pricing"

const stripe = new Stripe(process.env.STRIPE_ACCESS_TOKEN || "")

export default stripe
export { stripe }

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

// Price IDs are public identifiers (not secrets); env vars override the defaults.
const PRICE_IDS: Record<PriceRegion, string> = {
  international: process.env.STRIPE_PRICE_ID_USD || "price_1UIhs5AF2CmMVQpXhyai7oSq",
  brasil: process.env.STRIPE_PRICE_ID_BRL || "price_1UIiKTAF2CmMVQpXDHSZP32t",
  americas: process.env.STRIPE_PRICE_ID_LATAM || "price_1UIiKTAF2CmMVQpX2nfI2OT6",
}

export function getPriceIdForRegion(region: PriceRegion) {
  return PRICE_IDS[region]
}
