import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { startOfDay } from "date-fns"

// This route would be called by a cron job to send reminders
export async function GET() {
  try {
    const today = startOfDay(new Date())

    // Get all reminders that are due today and not completed
    const reminders = await db.reminder.findMany({
      where: {
        reminderDate: {
          lte: new Date(),
        },
        isCompleted: false,
      },
      include: {
        savedItem: true,
        user: true,
      },
    })

    // In a real app, this would send emails or notifications to users
    for (const reminder of reminders) {
      console.log(`Sending reminder to ${reminder.user.email} for item: ${reminder.savedItem.title}`)

      // Mark the reminder as completed
      await db.reminder.update({
        where: { id: reminder.id },
        data: { isCompleted: true },
      })
    }

    return NextResponse.json({ success: true, remindersSent: reminders.length })
  } catch (error) {
    console.error("Error sending reminders:", error)
    return NextResponse.json({ error: "Failed to send reminders" }, { status: 500 })
  }
}
