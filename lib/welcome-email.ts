import "server-only"

import { Resend } from "resend"

type Lang = "pt" | "en" | "es"

const FROM = "Lytli <noreply@lytli.com>"
const APP_URL = "https://app.lytli.com"

const copy: Record<Lang, { subject: string; heading: string; body: string; cta: string; fallback: string }> = {
  pt: {
    subject: "Bem-vindo ao Lytli!",
    heading: "Sua conta foi criada",
    body: "Que bom ter você aqui. Agora você pode organizar medicamentos, consultas e o dia a dia de quem você cuida, tudo em um só lugar.",
    cta: "Abrir o Lytli",
    fallback: "Se o botão não funcionar, copie e cole este link no navegador:",
  },
  en: {
    subject: "Welcome to Lytli!",
    heading: "Your account is ready",
    body: "We're glad you're here. You can now keep track of medications, appointments and daily care for your loved one, all in one place.",
    cta: "Open Lytli",
    fallback: "If the button doesn't work, copy and paste this link into your browser:",
  },
  es: {
    subject: "¡Bienvenido a Lytli!",
    heading: "Tu cuenta fue creada",
    body: "Nos alegra tenerte aquí. Ahora puedes organizar medicamentos, citas y el día a día de tu ser querido, todo en un solo lugar.",
    cta: "Abrir Lytli",
    fallback: "Si el botón no funciona, copia y pega este enlace en tu navegador:",
  },
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

/** Picks the app language from the `lytli-lang` cookie, then Accept-Language, then English. */
export function resolveEmailLang(headers: Headers | undefined): Lang {
  const cookie = headers?.get("cookie") ?? ""
  const match = cookie.match(/(?:^|;\s*)lytli-lang=(pt|en|es)(?:;|$)/)
  if (match) return match[1] as Lang

  const accept = (headers?.get("accept-language") ?? "").toLowerCase()
  const primary = accept.split(",")[0]?.trim().slice(0, 2)
  return primary === "pt" || primary === "es" ? primary : "en"
}

export async function sendWelcomeEmail({ to, lang }: { to: string; lang: Lang }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("[welcome-email] RESEND_API_KEY is not set; welcome email was not sent")
    return { sent: false as const }
  }

  const c = copy[lang]
  const html = `<!doctype html>
<html><body style="margin:0;background:#F4F7F5;font-family:Arial,Helvetica,sans-serif;color:#1F2A24">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFFFF;border-radius:16px;padding:32px">
        <tr><td align="center" style="padding-bottom:20px">
          <div style="width:56px;height:56px;border-radius:14px;background:#E85D75;color:#FFFFFF;font-size:26px;line-height:56px;font-weight:bold">L</div>
        </td></tr>
        <tr><td style="font-size:20px;font-weight:bold;padding-bottom:12px;text-align:center">${escapeHtml(c.subject)}</td></tr>
        <tr><td style="font-size:15px;font-weight:bold;padding-bottom:8px">${escapeHtml(c.heading)}</td></tr>
        <tr><td style="font-size:15px;line-height:1.5;padding-bottom:24px;color:#5A6B62">${escapeHtml(c.body)}</td></tr>
        <tr><td align="center" style="padding-bottom:24px">
          <a href="${APP_URL}" style="display:inline-block;background:#2D9E6B;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:999px">${escapeHtml(c.cta)}</a>
        </td></tr>
        <tr><td style="font-size:12px;line-height:1.5;color:#5A6B62">${escapeHtml(c.fallback)}<br><a href="${APP_URL}" style="color:#2D9E6B">${APP_URL}</a></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

  const text = `${c.subject}\n\n${c.heading}\n\n${c.body}\n\n${c.cta}: ${APP_URL}`

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({ from: FROM, to, subject: c.subject, html, text })
    if (error) {
      console.error("[welcome-email] Resend rejected the welcome email:", error)
      return { sent: false as const }
    }
    return { sent: true as const }
  } catch (err) {
    console.error("[welcome-email] Failed to send welcome email:", err)
    return { sent: false as const }
  }
}
