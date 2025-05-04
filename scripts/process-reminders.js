import { PrismaClient } from "@prisma/client"
import { startOfDay, endOfDay } from "date-fns"

// This script can be run by a cron job to process reminders daily

async function processReminders() {
  const prisma = new PrismaClient()

  try {
    console.log("Processing reminders...")

    const today = new Date()

    // Get all reminders that are due today and not completed
    const reminders = await prisma.reminder.findMany({
      where: {
        reminderDate: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
        isCompleted: false,
      },
      include: {
        savedItem: true,
        user: true,
      },
    })

    console.log(`Found ${reminders.length} reminders to process`)

    // In a real app, this would send emails or notifications to users
    for (const reminder of reminders) {
      console.log(`Processing reminder for ${reminder.user.email || reminder.userId}`)
      console.log(`Item: ${reminder.savedItem.title}`)
      console.log(`URL: ${reminder.savedItem.url}`)

      // In a real app, you would send an email or notification here

      // Mark the reminder as completed
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { isCompleted: true },
      })

      console.log(`Marked reminder ${reminder.id} as completed`)
    }

    console.log("Reminder processing completed")
  } catch (error) {
    console.error("Error processing reminders:", error)
  } finally {
    await prisma.$disconnect()
  }
}

processReminders()
