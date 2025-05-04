"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { syncYouTube } from "@/lib/platforms/youtube"
import { syncTwitter } from "@/lib/platforms/twitter"
import { syncGitHub } from "@/lib/platforms/github"

export async function syncContent() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  // Get all active platforms for the user
  const platforms = await db.platform.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    include: {
      user: true,
    },
  })

  // For each platform, fetch the latest saved content
  for (const platform of platforms) {
    try {
      switch (platform.name) {
        case "youtube":
          await syncYouTube(platform, platform.user)
          break
        case "twitter":
          await syncTwitter(platform, platform.user)
          break
        case "github":
          await syncGitHub(platform, platform.user)
          break
        default:
          console.log(`Unknown platform: ${platform.name}`)
      }
    } catch (error) {
      console.error(`Error syncing ${platform.name}:`, error)
    }
  }

  revalidatePath("/dashboard")
  redirect("/dashboard")
}
