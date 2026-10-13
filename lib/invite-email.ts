import "server-only"

import { Resend } from "resend"

type Lang = "pt" | "en" | "es"

const FROM = "Lytli <noreply@lytli.com>"

const copy: Record<Lang, { subject: string; intro: (inviter: string) => string; body: string; cta: string; fallback: string }> = {
  pt: {
    subject: "Você foi convidado para o Lytli",
    intro: (inviter) => `${inviter} convidou você para fazer parte da rede de cuidado no Lytli.`,
    body: "Com o Lytli, a família acompanha medicamentos, consultas e o dia a dia de quem é cuidado, tudo em um só lugar.",
    cta: "Aceitar convite",
    fallback: "Se o botão não funcionar, copie e cole este link no navegador:",
  },
  en: {
    subject: "You've been invited to Lytli",
    intro: (inviter) => `${inviter} invited you to join their care network on Lytli.`,
    body: "With Lytli, the family keeps track of medications, appointments and daily care for their loved one, all in one place.",
    cta: "Accept invite",
    fallback: "If the button doesn't work, copy and paste this link into your browser:",
  },
  es: {
    subject: "Te han invitado a Lytli",
    intro: (inviter) => `${inviter} te invitó a formar parte de su red de cuidado en Lytli.`,
    body: "Con Lytli, la familia sigue los medicamentos, las citas y el día a día de su ser querido, todo en un solo lugar.",
    cta: "Aceptar invitación",
    fallback: "Si el botón no funciona, copia y pega este enlace en tu navegador:",
  },
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

export function normalizeLang(value: string | undefined): Lang {
  return value === "pt" || value === "es" ? value : "en"
}

export async function sendInviteEmail({
  to,
  inviteUrl,
  inviterName,
  lang,
}: {
  to: string
  inviteUrl: string
  inviterName: string
  lang: Lang
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("[invite-email] RESEND_API_KEY is not set; invite email was not sent")
    return { sent: false as const }
  }

  const c = copy[lang]
  const inviter = escapeHtml(inviterName)
  const url = escapeHtml(inviteUrl)

  const html = `<!doctype html>
<html><body style="margin:0;background:#F4F7F5;font-family:Arial,Helvetica,sans-serif;color:#1F2A24">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFFFF;border-radius:16px;padding:32px">
        <tr><td align="center" style="padding-bottom:20px">
          <div style="width:56px;height:56px;border-radius:14px;background:#E85D75;color:#FFFFFF;font-size:26px;line-height:56px;font-weight:bold">L</div>
        </td></tr>
        <tr><td style="font-size:20px;font-weight:bold;padding-bottom:12px;text-align:center">${escapeHtml(c.subject)}</td></tr>
        <tr><td style="font-size:15px;line-height:1.5;padding-bottom:8px">${escapeHtml(c.intro(inviterName)).replace(escapeHtml(inviterName), `<strong>${inviter}</strong>`)}</td></tr>
        <tr><td style="font-size:15px;line-height:1.5;padding-bottom:24px;color:#5A6B62">${escapeHtml(c.body)}</td></tr>
        <tr><td align="center" style="padding-bottom:24px">
          <a href="${url}" style="display:inline-block;background:#2D9E6B;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:999px">${escapeHtml(c.cta)}</a>
        </td></tr>
        <tr><td style="font-size:12px;line-height:1.5;color:#5A6B62">${escapeHtml(c.fallback)}<br><a href="${url}" style="color:#2D9E6B;word-break:break-all">${url}</a></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

  const text = `${c.intro(inviterName)}\n\n${c.body}\n\n${c.cta}: ${inviteUrl}`

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({ from: FROM, to, subject: c.subject, html, text })
  if (error) {
    console.error("[invite-email] Resend rejected the invite email:", error)
    return { sent: false as const }
  }
  return { sent: true as const }
}
