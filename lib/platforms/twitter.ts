import { TwitterApi } from "twitter-api-v2"
import type { Platform, User } from "@prisma/client"
import { db } from "@/lib/db"

export async function syncTwitter(platform: Platform, user: User) {
  try {
    // Find the user's Twitter account
    const account = await db.account.findFirst({
      where: {
        userId: user.id,
        provider: "twitter",
      },
    })

    if (!account || !account.access_token) {
      console.error("No Twitter account found for user")
      return
    }

    // Set up the Twitter API client
    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_CLIENT_ID || "",
      appSecret: process.env.TWITTER_CLIENT_SECRET || "",
      accessToken: account.access_token,
      accessSecret: account.refresh_token || "",
    })

    // Get the user's Twitter ID
    const currentUser = await twitterClient.v2.me()
    const userId = currentUser.data.id

    // Fetch bookmarks
    const bookmarks = await twitterClient.v2.bookmarks({
      max_results: 100,
      expansions: ["author_id", "attachments.media_keys"],
      "tweet.fields": ["created_at", "text", "public_metrics", "entities"],
      "user.fields": ["name", "username", "profile_image_url"],
      "media.fields": ["url", "preview_image_url"],
    })

    // Fetch liked tweets
    const likedTweets = await twitterClient.v2.userLikedTweets(userId, {
      max_results: 100,
      expansions: ["author_id", "attachments.media_keys"],
      "tweet.fields": ["created_at", "text", "public_metrics", "entities"],
      "user.fields": ["name", "username", "profile_image_url"],
      "media.fields": ["url", "preview_image_url"],
    })

    // Process bookmarks
    for (const tweet of bookmarks.data.data || []) {
      await saveTwitterTweet(tweet, bookmarks.data.includes, platform.id, user.id, "bookmark")
    }

    // Process liked tweets
    for (const tweet of likedTweets.data.data || []) {
      await saveTwitterTweet(tweet, likedTweets.data.includes, platform.id, user.id, "liked")
    }

    // Update last synced timestamp
    await db.platform.update({
      where: { id: platform.id },
      data: { lastSynced: new Date() },
    })

    return true
  } catch (error) {
    console.error("Error syncing Twitter content:", error)

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

async function saveTwitterTweet(tweet: any, includes: any, platformId: string, userId: string, source: string) {
  if (!tweet.id || !tweet.text) return

  // Find author info
  let authorName = "Unknown"
  let authorUsername = "unknown"

  if (tweet.author_id && includes?.users) {
    const author = includes.users.find((user: any) => user.id === tweet.author_id)
    if (author) {
      authorName = author.name
      authorUsername = author.username
    }
  }

  // Find media
  let thumbnailUrl = null
  if (tweet.attachments?.media_keys && includes?.media) {
    const media = includes.media.find((m: any) => tweet.attachments.media_keys.includes(m.media_key))
    if (media) {
      thumbnailUrl = media.url || media.preview_image_url
    }
  }

  // Check if the tweet already exists
  const existingTweet = await db.savedItem.findUnique({
    where: {
      externalId_platformId: {
        externalId: tweet.id,
        platformId: platformId,
      },
    },
  })

  if (!existingTweet) {
    // Create a new saved item
    await db.savedItem.create({
      data: {
        externalId: tweet.id,
        title: `Tweet by @${authorUsername}`,
        description: tweet.text,
        url: `https://twitter.com/${authorUsername}/status/${tweet.id}`,
        thumbnailUrl: thumbnailUrl,
        contentType: "twitter_tweet",
        platformId: platformId,
        userId: userId,
        tags: {
          connectOrCreate: [
            {
              where: { name: source },
              create: { name: source },
            },
            {
              where: { name: "twitter" },
              create: { name: "twitter" },
            },
          ],
        },
      },
    })
  }
}
