"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, Copy, Check } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { ScreenHeader } from "@/components/screen-header"
import { SectionLabel } from "@/components/lytli-ui"
import { SheetModal, Field, inputClass } from "@/components/sheet-modal"
import { inviteFamily, cancelInvite, removeFamilyMember } from "@/app/actions/family"
import type { TKey } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Member = { id: number; name: string; relationship: string | null; role: string; status: string }
type Invite = { id: number; name: string | null; email: string | null; code: string; role: string }

const palette = ["#2D9E6B", "#E8845C", "#6B7FD7", "#C77DA3", "#D0A24C"]

const shareSettings: { key: TKey; defaultVisible: boolean }[] = [
  { key: "medications", defaultVisible: true },
  { key: "appointments", defaultVisible: true },
  { key: "dailyCheckin", defaultVisible: true },
  { key: "aiSessions", defaultVisible: false },
]

export function FamilyClient({
  recipientName,
  members,
  invites,
}: {
  recipientName: string
  members: Member[]
  invites: Invite[]
}) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({ name: "", email: "", role: "viewer" })
  const [copied, setCopied] = useState<number | null>(null)
  const [visible, setVisible] = useState<Record<string, boolean>>(
    Object.fromEntries(shareSettings.map((s) => [s.key, s.defaultVisible])),
  )

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    startTransition(async () => {
      await inviteFamily(form)
      setForm({ name: "", email: "", role: "viewer" })
      setOpen(false)
    })
  }

  function copyInvite(inv: Invite) {
    const url = `${window.location.origin}/login?invite=${inv.code}`
    navigator.clipboard?.writeText(url)
    setCopied(inv.id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <ScreenHeader title={t("familyCircle")} sub={`${recipientName} · ${t("careTeam")}`} />

      <SectionLabel>{t("careTeamLabel")}</SectionLabel>

      {members.length === 0 && invites.length === 0 && (
        <p className="mb-3 rounded-2xl border border-border bg-card p-4 text-[13px] leading-relaxed text-muted-foreground">
          {t("noFamily")}
        </p>
      )}

      {members.map((m, i) => (
        <div key={m.id} className="mb-2 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
            style={{ backgroundColor: palette[i % palette.length] }}
          >
            {m.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="mb-0.5 text-sm font-semibold text-foreground">{m.name}</div>
            <div className="text-xs text-muted-foreground">
              {m.relationship || (m.role === "caregiver" ? t("roleCaregiver") : t("roleViewer"))}
            </div>
          </div>
          <span className="rounded-full bg-pill-done px-2.5 py-0.5 text-[11px] font-medium text-pill-done-foreground">
            {t("activeNow")}
          </span>
          <button
            type="button"
            aria-label={t("remove")}
            onClick={() => startTransition(async () => { await removeFamilyMember(m.id) })}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-pill-missed hover:text-destructive cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      {invites.length > 0 && (
        <>
          <SectionLabel>{t("pendingInvites")}</SectionLabel>
          {invites.map((inv) => (
            <div key={inv.id} className="mb-2 rounded-2xl border border-amber-border bg-amber p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-amber-title">{inv.name}</div>
                  <div className="text-xs text-amber-text">
                    {t("pending")} · {t("inviteCreated")} <span className="font-mono font-semibold">{inv.code}</span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={t("copyLink")}
                  onClick={() => copyInvite(inv)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-amber-text hover:bg-amber-border cursor-pointer"
                >
                  {copied === inv.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  aria-label={t("cancel")}
                  onClick={() => startTransition(async () => { await cancelInvite(inv.id) })}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-amber-text hover:bg-amber-border cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="my-2 flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-primary bg-card py-3 text-[13px] font-medium text-primary transition-colors hover:bg-secondary cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        {t("inviteMember")}
      </button>

      <SectionLabel>{t("sharingSettings")}</SectionLabel>

      <div className="rounded-2xl border border-border bg-card px-4">
        {shareSettings.map((s) => {
          const isVisible = visible[s.key]
          return (
            <div key={s.key} className="flex items-center justify-between border-b border-mint py-2.5 last:border-none">
              <span className="text-[13px] text-foreground">{t(s.key)}</span>
              <button
                type="button"
                aria-pressed={isVisible}
                onClick={() => setVisible((p) => ({ ...p, [s.key]: !p[s.key] }))}
                className={cn(
                  "text-[13px] font-medium transition-colors cursor-pointer",
                  isVisible ? "text-primary" : "text-muted-foreground",
                )}
              >
                {isVisible ? t("visible") : t("hidden")}
              </button>
            </div>
          )
        })}
      </div>

      <SheetModal open={open} onClose={() => setOpen(false)} title={t("inviteMember")}>
        <form onSubmit={submit}>
          <Field label={t("inviteName")}>
            <input autoFocus className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label={`${t("inviteEmail")} (${t("optional")})`}>
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </Field>
          <Field label={t("inviteRole")}>
            <select className={inputClass} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              <option value="viewer">{t("roleViewer")}</option>
              <option value="caregiver">{t("roleCaregiver")}</option>
            </select>
          </Field>
          <button
            type="submit"
            disabled={pending || !form.name.trim()}
            className="mt-2 w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#1f7a52] disabled:opacity-50 cursor-pointer"
          >
            {pending ? t("saving") : t("inviteMember")}
          </button>
        </form>
      </SheetModal>
    </div>
  )
}
