"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, Check } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { ScreenHeader } from "@/components/screen-header"
import { SectionLabel } from "@/components/lytli-ui"
import { SheetModal, Field, inputClass } from "@/components/sheet-modal"
import { addMedication, deleteMedication, toggleDose, type MedRow, type Dose } from "@/app/actions/medications"
import { parseTimes } from "@/lib/schedule"
import { cn } from "@/lib/utils"

export function MedicationsClient({ meds, doses }: { meds: MedRow[]; doses: Dose[] }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({ name: "", dosage: "", times: "", frequency: "", notes: "" })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    startTransition(async () => {
      await addMedication(form)
      setForm({ name: "", dosage: "", times: "", frequency: "", notes: "" })
      setOpen(false)
    })
  }

  return (
    <div>
      <ScreenHeader title={t("medications")} sub={t("medicationsSub")} />

      <SectionLabel>{t("today")}</SectionLabel>

      {doses.length === 0 ? (
        <p className="mb-4 rounded-2xl border border-border bg-card p-4 text-[13px] leading-relaxed text-muted-foreground">
          {t("noMeds")}
        </p>
      ) : (
        doses.map((d) => (
          <div
            key={`${d.medicationId}-${d.time}`}
            className="mb-2 flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"
          >
            <button
              type="button"
              aria-label={d.taken ? "Marcar como não tomado" : "Marcar como tomado"}
              onClick={() => startTransition(async () => { await toggleDose(d.medicationId, d.time) })}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors cursor-pointer",
                d.taken ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-transparent",
              )}
            >
              <Check className="h-4 w-4" />
            </button>
            <div className="flex-1">
              <div className={cn("text-sm font-semibold text-foreground", d.taken && "line-through opacity-60")}>
                {d.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {d.time}
                {d.dosage ? ` · ${d.dosage}` : ""}
              </div>
            </div>
          </div>
        ))
      )}

      <SectionLabel>{t("medications")}</SectionLabel>

      {meds.map((m) => (
        <div key={m.id} className="mb-2 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">{m.name}</div>
            <div className="text-xs text-muted-foreground">
              {[m.dosage, parseTimes(m.times).join(", ")].filter(Boolean).join(" · ")}
            </div>
          </div>
          <button
            type="button"
            aria-label={t("delete")}
            onClick={() => {
              if (confirm(t("deleteMedConfirm"))) startTransition(async () => { await deleteMedication(m.id) })
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-pill-missed hover:text-destructive cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-primary bg-card py-3 text-[13px] font-medium text-primary transition-colors hover:bg-secondary cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        {t("addMedication")}
      </button>

      <SheetModal open={open} onClose={() => setOpen(false)} title={t("addMedication")}>
        <form onSubmit={submit}>
          <Field label={t("medName")}>
            <input
              autoFocus
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label={t("medDosage")}>
            <input
              className={inputClass}
              placeholder="10mg"
              value={form.dosage}
              onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))}
            />
          </Field>
          <Field label={t("medTimes")}>
            <input
              className={inputClass}
              placeholder="08:00, 20:00"
              value={form.times}
              onChange={(e) => setForm((f) => ({ ...f, times: e.target.value }))}
            />
          </Field>
          <Field label={`${t("medNotes")} (${t("optional")})`}>
            <input
              className={inputClass}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </Field>
          <button
            type="submit"
            disabled={pending || !form.name.trim()}
            className="mt-2 w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#1f7a52] disabled:opacity-50 cursor-pointer"
          >
            {pending ? t("saving") : t("save")}
          </button>
        </form>
      </SheetModal>
    </div>
  )
}
