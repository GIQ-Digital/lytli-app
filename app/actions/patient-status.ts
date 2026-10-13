"use server"

import { after } from "next/server"
import { revalidatePath } from "next/cache"
import { and, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { careRecipient, patientStatus } from "@/lib/db/schema"
import { getUserId } from "@/lib/auth-helpers"
import { notifyFamily } from "@/lib/family-notify"
import type { LocalizedText } from "@/lib/notify"

export type PatientStatusValue = "well" | "soso" | "unwell"
const STATUSES: PatientStatusValue[] = ["well", "soso", "unwell"]

const STATUS_TEXT: Record<PatientStatusValue, LocalizedText> = {
  well: { pt: "Bem", en: "Doing well", es: "Bien" },
  soso: { pt: "Mais ou menos", en: "So so", es: "Más o menos" },
  unwell: { pt: "Não está bem", en: "Not doing well", es: "No está bien" },
}

export async function getPatientStatus(careProfileId: number) {
  const userId = await getUserId()
  const [row] = await db
    .select({ status: patientStatus.status, updatedAt: patientStatus.updatedAt })
    .from(patientStatus)
    .where(and(eq(patientStatus.userId, userId), eq(patientStatus.careProfileId, careProfileId)))
    .orderBy(desc(patientStatus.updatedAt), desc(patientStatus.id))
    .limit(1)
  if (!row || !STATUSES.includes(row.status as PatientStatusValue)) return null
  return { status: row.status as PatientStatusValue, updatedAt: row.updatedAt.toISOString() }
}

export async function setPatientStatus(careProfileId: number, status: PatientStatusValue) {
  const userId = await getUserId()
  if (!STATUSES.includes(status)) throw new Error("Invalid status")
  if (!Number.isInteger(careProfileId) || careProfileId <= 0) throw new Error("Invalid profile")

  const [profile] = await db
    .select({ id: careRecipient.id, name: careRecipient.name })
    .from(careRecipient)
    .where(and(eq(careRecipient.id, careProfileId), eq(careRecipient.userId, userId)))
    .limit(1)
  if (!profile) throw new Error("Not found")

  const previous = await getPatientStatus(careProfileId)
  await db.insert(patientStatus).values({ userId, careProfileId, status })
  revalidatePath("/home")

  if (previous?.status !== status) {
    const name = profile.name
    after(() =>
      notifyFamily(
        userId,
        {
          pt: `Atualização de ${name}`,
          en: `${name} status update`,
          es: `Actualización de ${name}`,
        },
        STATUS_TEXT[status],
      ),
    )
  }
  return { ok: true }
}
