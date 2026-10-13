export type DayPart = "morning" | "afternoon" | "evening"

export function parseTimes(times: string | null | undefined): string[] {
  if (!times) return []
  return times
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
}

export function dayPartFor(time: string): DayPart {
  const hour = Number.parseInt(time.split(":")[0] ?? "0", 10)
  if (hour < 12) return "morning"
  if (hour < 18) return "afternoon"
  return "evening"
}

/** Format "HH:mm" (24h) into a 12h label like "8:00 AM". */
export function formatTime(time: string): string {
  const [hStr, mStr] = time.split(":")
  let hour = Number.parseInt(hStr ?? "0", 10)
  const min = mStr ?? "00"
  const suffix = hour >= 12 ? "PM" : "AM"
  hour = hour % 12
  if (hour === 0) hour = 12
  return `${hour}:${min} ${suffix}`
}

/** Local date as YYYY-MM-DD */
export function todayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
