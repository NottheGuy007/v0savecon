"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { addDays } from "date-fns"

export async function createReminder(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const savedItemId = formData.get("savedItemId") as string

  // Check if the saved item exists and belongs to the user
  const savedItem = await db.savedItem.findFirst({
    where: {
      id: savedItemId,
      userId: session.user.id,
    },
  })

  if (!savedItem) {
    throw new Error("Saved item not found")
  }

  // Check if a reminder already exists
  const existingReminder = await db.reminder.findFirst({
    where: {
      savedItemId: savedItemId,
      userId: session.user.id,
    },
  })

  if (existingReminder) {
    // Reminder already exists, do nothing
    revalidatePath("/dashboard")
    return
  }

  // Create a new reminder (default to 3 days from now)
  await db.reminder.create({
    data: {
      savedItemId: savedItemId,
      userId: session.user.id,
      reminderDate: addDays(new Date(), 3),
    },
  })

  revalidatePath("/dashboard")
}
