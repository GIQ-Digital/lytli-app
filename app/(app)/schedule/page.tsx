import { ScheduleClient } from "@/components/schedule-client"
import { getAppointments } from "@/app/actions/appointments"

export default async function SchedulePage() {
  const appointments = await getAppointments()
  return <ScheduleClient appointments={appointments} />
}
