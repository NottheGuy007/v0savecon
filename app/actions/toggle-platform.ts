"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function togglePlatform(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const platformId = formData.get("platformId") as string

  // Get the platform
  const platform = await db.platform.findUnique({
    where: { id: platformId },
  })

  if (!platform) {
    throw new Error("Platform not found")
  }

  // Check if the platform belongs to the user
  if (platform.userId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  // Toggle the platform's active status
  await db.platform.update({
    where: { id: platformId },
    data: { isActive: !platform.isActive },
  })

  revalidatePath("/settings")
}
