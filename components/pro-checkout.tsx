"use client"

import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Check } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { startProCheckout, confirmProCheckout } from "@/app/actions/stripe"

// Hardcoded because the Vercel Stripe integration overrides NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
// with a key from a different account. Publishable keys are public by design.
const stripePromise = loadStripe(
  "pk_test_51TzfP0AF2CmMVQpXLGZExKdKusNv4kB0UzBS8yR7FvzaDls8ad1aVV8xdx6UNAmQwiqQRBHjKcWVhzMjVYjn0tKI00421XhYIG",
)

export function ProCheckout() {
  const { t } = useLanguage()
  const router = useRouter()
  const sessionIdRef = useRef<string | null>(null)
  const [done, setDone] = useState(false)

  const fetchClientSecret = useCallback(async () => {
    const { clientSecret, sessionId } = await startProCheckout()
    sessionIdRef.current = sessionId
    return clientSecret as string
  }, [])

  const onComplete = useCallback(async () => {
    if (!sessionIdRef.current) return
    const res = await confirmProCheckout(sessionIdRef.current)
    if (res.ok) {
      setDone(true)
      setTimeout(() => {
        router.push("/profile")
        router.refresh()
      }, 1800)
    }
  }, [router])

  if (done) {
    return (
      <div className="rounded-2xl border border-mint-border bg-mint p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-green-darker">{t("paymentSuccess")}</p>
      </div>
    )
  }

  return (
    <div id="checkout" className="overflow-hidden rounded-2xl border border-border bg-card">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret, onComplete }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
