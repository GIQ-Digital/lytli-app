"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Plus, Check, Pill, Calendar, UserRound } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { LanguageToggle } from "@/components/language-toggle"
import { SectionLabel, CardLabel } from "@/components/lytli-ui"
import { SheetModal, Field, inputClass } from "@/components/sheet-modal"
import { toggleDose, type Dose } from "@/app/actions/medications"
import { toggleTask, addTask, type TaskRow } from "@/app/actions/tasks"
import type { AppointmentRow } from "@/app/actions/appointments"
import { cn } from "@/lib/utils"
import { PatientStatusCard } from "@/components/patient-status-card"
import type { PatientStatusValue } from "@/app/actions/patient-status"

export function HomeClient({
  name,
  recipientName,
  doses,
  tasks,
  nextAppt,
  adherence,
  careProfileId,
  patientStatus,
}: {
  name: string
  recipientName: string
  doses: Dose[]
  tasks: TaskRow[]
  nextAppt: AppointmentRow | null
  adherence: number
  careProfileId: number | null
  patientStatus: { status: PatientStatusValue; updatedAt: string } | null
}) {
  const { t, lang } = useLanguage()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t("goodMorning") : hour < 18 ? t("goodAfternoon") : t("goodEvening")
  const nextDose = doses.find((d) => !d.taken)

  function submitTask(e: React.FormEvent) {
    e.preventDefault()
    if (!taskTitle.trim()) return
    startTransition(async () => {
      await addTask({ title: taskTitle })
      setTaskTitle("")
      setOpen(false)
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-[13px] text-muted-foreground">{greeting},</div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">{name}</h1>
          <div className="text-[13px] text-muted-foreground">
            {t("caringFor")} {recipientName}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle variant="pills" />
          <Link
            href="/account"
            aria-label={t("openAccount")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-green-dark transition-colors hover:bg-secondary"
          >
            <UserRound className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </div>

      {/* Daily tip */}
      <div className="mb-3.5 rounded-2xl border border-mint-border bg-mint p-4">
        <CardLabel withDot>{t("dailyTip")}</CardLabel>
        <p className="text-[13px] leading-relaxed text-green-darker">{t("dailyTipContent")}</p>
      </div>

      {careProfileId !== null && (
        <PatientStatusCard
          careProfileId={careProfileId}
          recipientName={recipientName}
          initialStatus={patientStatus?.status ?? null}
          updatedAt={patientStatus?.updatedAt ?? null}
        />
      )}

      {/* Next dose / adherence */}
      <div className="mb-3.5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            <Pill className="h-3.5 w-3.5" /> {t("nextDose")}
          </div>
          <div className="text-sm font-semibold text-foreground">
            {nextDose ? `${nextDose.name}` : t("allDone")}
          </div>
          <div className="text-xs text-muted-foreground">{nextDose ? nextDose.time : `${adherence}%`}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" /> {t("nextAppt")}
          </div>
          {nextAppt ? (
            <>
              <div className="truncate text-sm font-semibold text-foreground">{nextAppt.title}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(nextAppt.startsAt).toLocaleDateString(lang, { day: "numeric", month: "short" })}
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">—</div>
          )}
        </div>
      </div>

      {/* Today's medications */}
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel>{t("todayMeds")}</SectionLabel>
        <Link href="/medications" className="text-xs font-medium text-primary">
          {t("viewAll")}
        </Link>
      </div>

      {doses.length === 0 ? (
        <p className="mb-3 rounded-2xl border border-border bg-card p-4 text-[13px] text-muted-foreground">
          {t("noMeds")}
        </p>
      ) : (
        doses.slice(0, 4).map((d) => (
          <div
            key={`${d.medicationId}-${d.time}`}
            className="mb-2 flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"
          >
            <button
              type="button"
              aria-label={d.name}
              aria-pressed={d.taken}
              onClick={() => startTransition(async () => { await toggleDose(d.medicationId, d.time) })}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors cursor-pointer",
                d.taken ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-transparent",
              )}
            >
              <Check className="h-4 w-4" />
            </button>
            <div className="flex-1">
              <div className={cn("text-[13px] font-medium text-foreground", d.taken && "line-through opacity-60")}>
                {d.name}
              </div>
              <div className="text-[11px] text-muted-foreground">{d.time}{d.dosage ? ` · ${d.dosage}` : ""}</div>
            </div>
          </div>
        ))
      )}

      {/* Tasks */}
      <div className="mb-2 mt-3 flex items-center justify-between">
        <SectionLabel>{t("todayTasks")}</SectionLabel>
      </div>

      {tasks.length === 0 ? (
        <p className="mb-3 rounded-2xl border border-border bg-card p-4 text-[13px] text-muted-foreground">
          {t("noTasks")}
        </p>
      ) : (
        <div className="mb-3 rounded-2xl border border-border bg-card px-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2.5 border-b border-mint py-2.5 last:border-none">
              <button
                type="button"
                aria-label={task.title}
                aria-pressed={task.completed}
                onClick={() => startTransition(async () => { await toggleTask(task.id, !task.completed) })}
                className={cn(
                  "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md text-xs transition-colors cursor-pointer",
                  task.completed ? "bg-primary text-primary-foreground" : "border-[1.5px] border-border bg-card",
                )}
              >
                {task.completed && "✓"}
              </button>
              <span className={cn("text-[13px] text-foreground", task.completed && "line-through opacity-60")}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-primary bg-card py-3 text-[13px] font-medium text-primary transition-colors hover:bg-secondary cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        {t("addTask")}
      </button>

      <SheetModal open={open} onClose={() => setOpen(false)} title={t("addTask")}>
        <form onSubmit={submitTask}>
          <Field label={t("taskTitle")}>
            <input
              autoFocus
              className={inputClass}
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
          </Field>
          <button
            type="submit"
            disabled={pending || !taskTitle.trim()}
            className="mt-2 w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#1f7a52] disabled:opacity-50 cursor-pointer"
          >
            {pending ? t("saving") : t("save")}
          </button>
        </form>
      </SheetModal>
    </div>
  )
}
