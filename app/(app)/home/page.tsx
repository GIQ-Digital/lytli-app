import { HomeClient } from "@/components/home-client"
import { getSession } from "@/lib/auth-helpers"
import { getRecipient } from "@/app/actions/care"
import { getTodaySchedule, getTodayAdherence } from "@/app/actions/medications"
import { getTasks } from "@/app/actions/tasks"
import { getUpcomingAppointments } from "@/app/actions/appointments"

export default async function HomePage() {
  const [session, recipient, doses, tasks, appts, adherence] = await Promise.all([
    getSession(),
    getRecipient(),
    getTodaySchedule(),
    getTasks(),
    getUpcomingAppointments(),
    getTodayAdherence(),
  ])

  const firstName = session?.user?.name?.split(" ")[0] ?? "there"

  return (
    <HomeClient
      name={firstName}
      recipientName={recipient?.name ?? "—"}
      doses={doses}
      tasks={tasks}
      nextAppt={appts[0] ?? null}
      adherence={adherence}
    />
  )
}
