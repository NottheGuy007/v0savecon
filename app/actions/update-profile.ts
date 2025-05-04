"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const name = formData.get("name") as string

  // Update the user's profile
  await db.user.update({
    where: { id: session.user.id },
    data: { name },
  })

  revalidatePath("/settings")
}
