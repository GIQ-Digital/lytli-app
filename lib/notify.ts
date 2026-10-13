import "server-only"

import webpush from "web-push"
import { Resend } from "resend"
import { eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { pushSubscriptions, user } from "@/lib/db/schema"

/*
 * Web Push uses a VAPID key pair (no Firebase). Generate one with:
 *
 *   npx web-push generate-vapid-keys
 *
 * then set these environment variables (Settings → Vars):
 *   VAPID_PUBLIC_KEY   = <Public Key>
 *   VAPID_PRIVATE_KEY  = <Private Key>
 *   VAPID_SUBJECT      = mailto:noreply@lytli.com
 */

type Lang = "pt" | "en" | "es"
export type LocalizedText = Record<Lang, string>

const FROM = "Lytli <noreply@lytli.com>"
const APP_URL = "https://app.lytli.com"

let vapidReady: boolean | null = null

function ensureVapid() {
  if (vapidReady !== null) return vapidReady
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || "mailto:noreply@lytli.com"
  if (!publicKey || !privateKey) {
    console.error("[notify] VAPID keys are not set; push is disabled")
    vapidReady = false
    return false
  }
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey)
    vapidReady = true
  } catch (err) {
    console.error("[notify] Invalid VAPID configuration:", err)
    vapidReady = false
  }
  return vapidReady
}

function pick(text: LocalizedText, lang: Lang) {
  return text[lang] || text.en || text.pt || text.es || ""
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

async function sendPush(userId: string, title: string, body: string, url: string) {
  if (!ensureVapid()) return 0

  const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId))
  if (subs.length === 0) return 0

  const payload = JSON.stringify({ title, body, url })
  const expired: number[] = []
  let delivered = 0

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload, {
          TTL: 60 * 60 * 24,
        })
        delivered++
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode
        // 404/410 mean the browser dropped the subscription; clean it up.
        if (status === 404 || status === 410) expired.push(sub.id)
        else console.error("[notify] Push failed:", status ?? err)
      }
    }),
  )

  if (expired.length > 0) {
    await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.id, expired))
  }
  return delivered
}

async function sendEmail(userId: string, title: string, body: string, url: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("[notify] RESEND_API_KEY is not set; email fallback skipped")
    return false
  }

  const rows = await db.select({ email: user.email }).from(user).where(eq(user.id, userId)).limit(1)
  const to = rows[0]?.email
  if (!to) return false

  const html = `<!doctype html>
<html><body style="margin:0;background:#F4F7F5;font-family:Arial,Helvetica,sans-serif;color:#1F2A24">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFFFF;border-radius:16px;padding:32px">
        <tr><td align="center" style="padding-bottom:20px">
          <div style="width:56px;height:56px;border-radius:14px;background:#E85D75;color:#FFFFFF;font-size:26px;line-height:56px;font-weight:bold">L</div>
        </td></tr>
        <tr><td style="font-size:18px;font-weight:bold;padding-bottom:12px">${escapeHtml(title)}</td></tr>
        <tr><td style="font-size:15px;line-height:1.5;padding-bottom:24px;color:#5A6B62">${escapeHtml(body)}</td></tr>
        <tr><td align="center">
          <a href="${url}" style="display:inline-block;background:#2D9E6B;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:999px">Lytli</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({ from: FROM, to, subject: title, html, text: `${title}\n\n${body}\n\n${url}` })
  if (error) {
    console.error("[notify] Resend rejected the email:", error)
    return false
  }
  return true
}

/**
 * Sends a notification by Web Push to every device the user subscribed,
 * falling back to email when there is no subscription or every push fails.
 * Never throws.
 */
export async function sendNotification({
  userId,
  title,
  body,
  userLanguage,
  url = APP_URL,
}: {
  userId: string
  title: LocalizedText
  body: LocalizedText
  userLanguage: Lang
  url?: string
}): Promise<{ channel: "push" | "email" | "none" }> {
  const localizedTitle = pick(title, userLanguage)
  const localizedBody = pick(body, userLanguage)

  try {
    const delivered = await sendPush(userId, localizedTitle, localizedBody, url)
    if (delivered > 0) return { channel: "push" }
  } catch (err) {
    console.error("[notify] Push step failed:", err)
  }

  try {
    if (await sendEmail(userId, localizedTitle, localizedBody, url)) return { channel: "email" }
  } catch (err) {
    console.error("[notify] Email step failed:", err)
  }

  return { channel: "none" }
}
