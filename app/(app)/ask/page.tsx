import { AskClient } from "@/components/ask-client"
import { getRecentSessions, getSessionUsage } from "@/app/actions/ask"

export default async function AskPage() {
  const [sessions, usage] = await Promise.all([getRecentSessions(), getSessionUsage()])
  const initialHistory = sessions.map((s) => ({ q: s.question, a: s.answer }))
  return <AskClient initialHistory={initialHistory} pro={usage.pro} remaining={usage.remaining} />
}
