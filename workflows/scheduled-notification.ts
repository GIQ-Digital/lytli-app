import { sleep } from "workflow"
import { deliverQueuedNotification } from "@/lib/notification-delivery"

/** Waits durably until the reminder's exact time, then sends it. */
export async function deliverScheduledNotification(queueId: number, scheduledAt: string) {
  "use workflow"

  await sleep(new Date(scheduledAt))
  return deliverQueuedNotification(queueId)
}
