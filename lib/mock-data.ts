export type MedStatus = "done" | "pending" | "missed"

export const caregiver = { name: "Sarah", initials: "SM" }

export const patient = {
  name: "Margaret",
  fullName: "Margaret Wilson",
  age: 78,
  relationship: "Mom",
  initial: "M",
  conditions: ["Type 2 Diabetes", "Hypertension", "Arthritis"],
}

export type Medication = {
  name: string
  time: string
  status: MedStatus
  group: "morning" | "afternoon" | "evening"
  note?: string
}

export const medications: Medication[] = [
  { name: "Losartan 50mg", time: "8:00 AM", status: "done", group: "morning" },
  { name: "Vitamin D 1000IU", time: "8:00 AM", status: "missed", group: "morning" },
  { name: "Metformin 500mg", time: "2:00 PM", status: "pending", group: "afternoon" },
  { name: "Atorvastatin 20mg", time: "8:00 PM", status: "pending", group: "evening", note: "takeWithFood" },
]

export const adherence = 75

export type Appointment = {
  title: string
  month: string
  day: string
  time: string
  location: string
}

export const appointments: Appointment[] = [
  { title: "Cardiologist — Dr. Chen", month: "MAY", day: "7", time: "10:30 AM", location: "Memorial Hospital" },
  { title: "Blood work — Lab Corp", month: "MAY", day: "10", time: "8:00 AM", location: "Fasting required" },
]

export type FamilyMember = {
  name: string
  initials: string
  color: string
  roleKey: "primaryCaregiver" | "son" | "daughter"
  place?: string
  status: "active" | "2h" | "1d"
}

export const family: FamilyMember[] = [
  { name: "Sarah M.", initials: "SM", color: "#2D9E6B", roleKey: "primaryCaregiver", status: "active" },
  { name: "James M.", initials: "JM", color: "#185FA5", roleKey: "son", place: "Boston", status: "2h" },
  { name: "Ana L.", initials: "AL", color: "#854F0B", roleKey: "daughter", place: "Miami", status: "1d" },
]

export const account = {
  sessionsUsed: 8,
  sessionsLimit: 20,
  plan: "pro",
  familySeatsUsed: 2,
  familySeatsTotal: 3,
}

export const checkin = {
  energy: 40,
  stress: 70,
  supported: 30,
}
