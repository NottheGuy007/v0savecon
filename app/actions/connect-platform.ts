"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function connectPlatform(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const platform = formData.get("platform") as string
  const userId = formData.get("userId") as string

  if (session.user.id !== userId) {
    throw new Error("Unauthorized")
  }

  // Check if platform is already connected
  const existingPlatform = await db.platform.findUnique({
    where: {
      name_userId: {
        name: platform,
        userId: userId,
      },
    },
  })

  if (existingPlatform) {
    // Update platform to active if it was previously deactivated
    if (!existingPlatform.isActive) {
      await db.platform.update({
        where: { id: existingPlatform.id },
        data: { isActive: true },
      })
    }
  } else {
    // Create new platform connection
    await db.platform.create({
      data: {
        name: platform,
        userId: userId,
        isActive: true,
      },
    })
  }

  // Trigger initial sync for the platform
  // In a real app, this would call the appropriate API to fetch saved content

  revalidatePath("/dashboard")
  redirect("/dashboard")
}
