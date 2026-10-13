"use client"

import { useMemo, useState, useTransition } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { ScreenHeader } from "@/components/screen-header"
import { SectionLabel } from "@/components/lytli-ui"
import { SheetModal, Field, inputClass } from "@/components/sheet-modal"
import { addAppointment, deleteAppointment, type AppointmentRow } from "@/app/actions/appointments"
import { cn } from "@/lib/utils"

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function ScheduleClient({ appointments }: { appointments: AppointmentRow[] }) {
  const { t, lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({ title: "", doctor: "", location: "", startsAt: "", reminderMinutes: 60 })

  const now = new Date()
  const [viewYear, viewMonth] = [now.getFullYear(), now.getMonth()]

  const apptDays = useMemo(() => {
    const set = new Set<number>()
    for (const a of appointments) {
      const d = new Date(a.startsAt)
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) set.add(d.getDate())
    }
    return set
  }, [appointments, viewYear, viewMonth])

  const cells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const arr: { day: number | null }[] = []
    for (let i = 0; i < firstDay; i++) arr.push({ day: null })
    for (let d = 1; d <= daysInMonth; d++) arr.push({ day: d })
    return arr
  }, [viewYear, viewMonth])

  const monthLabel = now.toLocaleDateString(lang, { month: "long", year: "numeric" })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.startsAt) return
    startTransition(async () => {
      await addAppointment(form)
      setForm({ title: "", doctor: "", location: "", startsAt: "", reminderMinutes: 60 })
      setOpen(false)
    })
  }

  return (
    <div>
      <ScreenHeader title={t("schedule")} sub={monthLabel} />

      <div className="mb-3.5 rounded-2xl border border-border bg-card p-4">
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((w) => (
            <div key={w} className="py-1.5 text-center text-[11px] font-semibold text-muted-foreground">
              {w}
            </div>
          ))}
          {cells.map((c, i) => {
            const isToday = c.day === now.getDate()
            const hasApt = c.day != null && apptDays.has(c.day)
            return (
              <div
                key={i}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-lg py-1.5 text-xs",
                  c.day == null && "text-transparent",
                  c.day != null && "text-foreground",
                  isToday && "rounded-full bg-primary font-semibold text-primary-foreground",
                )}
              >
                {c.day ?? "."}
                {hasApt && !isToday && <span className="mt-0.5 h-1 w-1 rounded-full bg-primary" />}
              </div>
            )
          })}
        </div>
      </div>

      <SectionLabel>{t("upcoming")}</SectionLabel>

      {appointments.length === 0 ? (
        <p className="mb-3 rounded-2xl border border-border bg-card p-4 text-[13px] text-muted-foreground">
          {t("noAppointments")}
        </p>
      ) : (
        appointments.map((a) => {
          const d = new Date(a.startsAt)
          return (
            <div key={a.id} className="mb-2.5 flex items-start gap-3.5 rounded-2xl border border-border bg-card p-4">
              <div className="min-w-[44px] rounded-[10px] bg-primary px-2.5 py-1.5 text-center text-primary-foreground">
                <div className="text-[10px] uppercase text-primary-foreground/80">
                  {d.toLocaleDateString(lang, { month: "short" })}
                </div>
                <div className="text-[22px] font-semibold leading-none">{d.getDate()}</div>
              </div>
              <div className="flex-1">
                <div className="mb-0.5 text-sm font-semibold text-foreground">{a.title}</div>
                <div className="mb-1.5 text-xs text-muted-foreground">
                  {d.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })}
                  {a.location ? ` · ${a.location}` : ""}
                </div>
                <span className="inline-block rounded-full bg-mint px-2.5 py-0.5 text-[11px] text-green-darker">
                  {t("reminderSet")}
                </span>
              </div>
              <button
                type="button"
                aria-label={t("delete")}
                onClick={() => startTransition(async () => { await deleteAppointment(a.id) })}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-pill-missed hover:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        })
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-primary bg-card py-3 text-[13px] font-medium text-primary transition-colors hover:bg-secondary cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        {t("addAppointment")}
      </button>

      <SheetModal open={open} onClose={() => setOpen(false)} title={t("addAppointment")}>
        <form onSubmit={submit}>
          <Field label={t("aptTitle")}>
            <input autoFocus className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </Field>
          <Field label={`${t("aptDoctor")} (${t("optional")})`}>
            <input className={inputClass} value={form.doctor} onChange={(e) => setForm((f) => ({ ...f, doctor: e.target.value }))} />
          </Field>
          <Field label={`${t("aptLocation")} (${t("optional")})`}>
            <input className={inputClass} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          </Field>
          <Field label={t("aptDate")}>
            <input type="datetime-local" className={inputClass} value={form.startsAt} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} />
          </Field>
          <Field label={t("aptReminder")}>
            <select
              className={inputClass}
              value={form.reminderMinutes}
              onChange={(e) => setForm((f) => ({ ...f, reminderMinutes: Number(e.target.value) }))}
            >
              <option value={15}>{t("min15")}</option>
              <option value={60}>{t("hour1")}</option>
              <option value={1440}>{t("day1")}</option>
            </select>
          </Field>
          <button
            type="submit"
            disabled={pending || !form.title.trim() || !form.startsAt}
            className="mt-2 w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#1f7a52] disabled:opacity-50 cursor-pointer"
          >
            {pending ? t("saving") : t("save")}
          </button>
        </form>
      </SheetModal>
    </div>
  )
}
