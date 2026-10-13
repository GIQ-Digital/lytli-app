"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, Check, Pencil } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { ScreenHeader } from "@/components/screen-header"
import { SectionLabel } from "@/components/lytli-ui"
import { SheetModal, Field, inputClass } from "@/components/sheet-modal"
import {
  addMedication,
  updateMedication,
  deleteMedication,
  toggleDose,
  setDoseStatus,
  type MedRow,
  type Dose,
  type DoseStatus,
} from "@/app/actions/medications"
import { parseTimes } from "@/lib/schedule"
import { COMMON_MEDICATIONS } from "@/lib/common-medications"
import { cn } from "@/lib/utils"

const EMPTY_FORM = { name: "", dosage: "", times: "", frequency: "", notes: "" }

const NEXT_STATUS: Record<DoseStatus, DoseStatus> = { pending: "taken", taken: "missed", missed: "pending" }

const STATUS_STYLE: Record<DoseStatus, string> = {
  pending: "bg-pill-pending text-pill-pending-foreground",
  taken: "bg-pill-done text-pill-done-foreground",
  missed: "bg-pill-missed text-pill-missed-foreground",
}

export function MedicationsClient({ meds, doses }: { meds: MedRow[]; doses: Dose[] }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState(EMPTY_FORM)

  const statusLabel: Record<DoseStatus, string> = {
    pending: t("pending"),
    taken: t("done"),
    missed: t("missed"),
  }

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(m: MedRow) {
    setEditingId(m.id)
    setForm({
      name: m.name,
      dosage: m.dosage ?? "",
      times: parseTimes(m.times).join(", "),
      frequency: m.frequency ?? "",
      notes: m.notes ?? "",
    })
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    startTransition(async () => {
      if (editingId !== null) await updateMedication(editingId, form)
      else await addMedication(form)
      close()
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
            <div className="min-w-0 flex-1">
              <div className={cn("text-sm font-semibold text-foreground", d.taken && "line-through opacity-60")}>
                {d.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {d.time}
                {d.dosage ? ` · ${d.dosage}` : ""}
              </div>
            </div>
            <button
              type="button"
              title={t("doseStatusHint")}
              aria-label={`${statusLabel[d.status]} — ${t("doseStatusHint")}`}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await setDoseStatus(d.medicationId, d.time, NEXT_STATUS[d.status])
                })
              }
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-opacity cursor-pointer disabled:opacity-60",
                STATUS_STYLE[d.status],
              )}
            >
              {statusLabel[d.status]}
            </button>
          </div>
        ))
      )}

      <SectionLabel>{t("medications")}</SectionLabel>

      {meds.map((m) => (
        <div key={m.id} className="mb-2 flex items-center gap-1 rounded-2xl border border-border bg-card p-4">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">{m.name}</div>
            <div className="text-xs text-muted-foreground">
              {[m.dosage, parseTimes(m.times).join(", ")].filter(Boolean).join(" · ")}
            </div>
          </div>
          <button
            type="button"
            aria-label={`${t("edit")} ${m.name}`}
            onClick={() => openEdit(m)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-primary cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
          </button>
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
        onClick={openAdd}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-primary bg-card py-3 text-[13px] font-medium text-primary transition-colors hover:bg-secondary cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        {t("addMedication")}
      </button>

      <SheetModal open={open} onClose={close} title={editingId !== null ? t("editMedication") : t("addMedication")}>
        <form onSubmit={submit}>
          <Field label={t("medName")}>
            <input
              autoFocus
              list="common-medications"
              autoComplete="off"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <datalist id="common-medications">
              {COMMON_MEDICATIONS.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
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
