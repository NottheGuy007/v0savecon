import { google } from "googleapis"
import type { Platform, User } from "@prisma/client"
import { db } from "@/lib/db"

export async function syncYouTube(platform: Platform, user: User) {
  try {
    // Find the user's Google account
    const account = await db.account.findFirst({
      where: {
        userId: user.id,
        provider: "google",
      },
    })

    if (!account || !account.access_token) {
      console.error("No Google account found for user")
      return
    }

    // Set up the YouTube API client
    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    })

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    })

    // Fetch liked videos
    const likedVideosResponse = await youtube.videos.list({
      part: ["snippet", "contentDetails"],
      myRating: "like",
      maxResults: 50,
    })

    // Fetch watch later playlist
    // First, get the user's watch later playlist ID
    const playlistsResponse = await youtube.playlists.list({
      part: ["snippet", "contentDetails"],
      mine: true,
    })

    let watchLaterPlaylistId = ""
    playlistsResponse.data.items?.forEach((playlist) => {
      if (playlist.snippet?.title === "Watch Later") {
        watchLaterPlaylistId = playlist.id || ""
      }
    })

    // Then get the videos in the watch later playlist
    let watchLaterVideos: any[] = []
    if (watchLaterPlaylistId) {
      const watchLaterResponse = await youtube.playlistItems.list({
        part: ["snippet", "contentDetails"],
        playlistId: watchLaterPlaylistId,
        maxResults: 50,
      })
      watchLaterVideos = watchLaterResponse.data.items || []
    }

    // Process liked videos
    const likedVideos = likedVideosResponse.data.items || []
    for (const video of likedVideos) {
      if (video.id && video.snippet) {
        await saveYouTubeVideo(video, platform.id, user.id, "liked")
      }
    }

    // Process watch later videos
    for (const item of watchLaterVideos) {
      if (item.snippet && item.contentDetails?.videoId) {
        // Get full video details
        const videoResponse = await youtube.videos.list({
          part: ["snippet", "contentDetails"],
          id: [item.contentDetails.videoId],
        })

        const video = videoResponse.data.items?.[0]
        if (video) {
          await saveYouTubeVideo(video, platform.id, user.id, "watch_later")
        }
      }
    }

    // Update last synced timestamp
    await db.platform.update({
      where: { id: platform.id },
      data: { lastSynced: new Date() },
    })

    return true
  } catch (error) {
    console.error("Error syncing YouTube content:", error)

    // If token expired, we should handle refresh
    if (error.message?.includes("invalid_grant") || error.message?.includes("token expired")) {
      // Mark platform as inactive until user reconnects
      await db.platform.update({
        where: { id: platform.id },
        data: { isActive: false },
      })
    }

    return false
  }
}

async function saveYouTubeVideo(video: any, platformId: string, userId: string, source: string) {
  if (!video.id || !video.snippet) return

  const videoId = typeof video.id === "string" ? video.id : video.id.videoId

  // Check if the video already exists
  const existingVideo = await db.savedItem.findUnique({
    where: {
      externalId_platformId: {
        externalId: videoId,
        platformId: platformId,
      },
    },
  })

  if (!existingVideo) {
    // Create a new saved item
    await db.savedItem.create({
      data: {
        externalId: videoId,
        title: video.snippet.title || "Untitled Video",
        description: video.snippet.description || "",
        url: `https://youtube.com/watch?v=${videoId}`,
        thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url || null,
        contentType: "youtube_video",
        platformId: platformId,
        userId: userId,
        tags: {
          connectOrCreate: [
            {
              where: { name: source },
              create: { name: source },
            },
            {
              where: { name: "youtube" },
              create: { name: "youtube" },
            },
          ],
        },
      },
    })
  }
}
