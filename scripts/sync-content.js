import { PrismaClient } from "@prisma/client"
import { syncYouTube } from "../lib/platforms/youtube"
import { syncTwitter } from "../lib/platforms/twitter"
import { syncGitHub } from "../lib/platforms/github"

// This script can be run by a cron job to sync content periodically

async function syncAllContent() {
  const prisma = new PrismaClient()

  try {
    console.log("Starting content sync...")

    // Get all active platforms
    const platforms = await prisma.platform.findMany({
      where: { isActive: true },
      include: { user: true },
    })

    console.log(`Found ${platforms.length} active platforms to sync`)

    // Process each platform
    for (const platform of platforms) {
      try {
        console.log(`Syncing ${platform.name} for user ${platform.user.email || platform.userId}`)

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

        // Update last synced timestamp
        await prisma.platform.update({
          where: { id: platform.id },
          data: { lastSynced: new Date() },
        })

        console.log(`Successfully synced ${platform.name}`)
      } catch (error) {
        console.error(`Error syncing ${platform.name}:`, error)
      }
    }

    console.log("Content sync completed")
  } catch (error) {
    console.error("Error in sync process:", error)
  } finally {
    await prisma.$disconnect()
  }
}

syncAllContent()
