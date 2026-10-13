import { betterAuth } from "better-auth"
import { magicLink } from "better-auth/plugins"
import { pool } from "@/lib/db"

async function deliverMagicLink({ email, url }: { email: string; url: string }) {
  // In production, send a real email. If a Resend API key is configured we use
  // it; otherwise we log the link so the flow is testable in preview/dev.
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.MAGIC_LINK_FROM ?? "Lytli <onboarding@resend.dev>"

  if (!apiKey) {
    console.log(`[v0] Magic link for ${email}: ${url}`)
    return
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: "Seu link de acesso ao Lytli",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color:#e07a5f;">Lytli</h2>
            <p>Toque no botão abaixo para entrar. O link expira em 5 minutos.</p>
            <p style="margin: 24px 0;">
              <a href="${url}" style="background:#e07a5f;color:#fff;padding:12px 20px;border-radius:9999px;text-decoration:none;">Entrar no Lytli</a>
            </p>
            <p style="color:#666;font-size:13px;">Se você não solicitou este acesso, ignore este e-mail.</p>
          </div>
        `,
      }),
    })
    if (!res.ok) {
      console.log(`[v0] Resend failed (${res.status}). Magic link for ${email}: ${url}`)
    }
  } catch (err) {
    console.log(`[v0] Resend error, magic link for ${email}: ${url}`, err)
  }
}

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  // Google is only registered when its credentials exist, so a missing key
  // never breaks the other sign-in methods.
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await deliverMagicLink({ email, url })
      },
    }),
  ],
  trustedOrigins: [
    ...(process.env.NODE_ENV === "development"
      ? [
          "http://localhost:3000",
          ...[
            process.env.V0_RUNTIME_URL,
            process.env.V0_DEV_APP_URL,
            process.env.V0_BUILD_URL,
            process.env.V0_SANDBOX_URL,
          ].filter((url): url is string => Boolean(url)),
        ]
      : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
})
