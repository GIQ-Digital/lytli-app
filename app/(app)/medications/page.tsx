import { MedicationsClient } from "@/components/medications-client"
import { getMedications, getTodaySchedule } from "@/app/actions/medications"

export default async function MedicationsPage() {
  const [meds, doses] = await Promise.all([getMedications(), getTodaySchedule()])
  return <MedicationsClient meds={meds} doses={doses} />
}
