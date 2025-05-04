import type { Platform, User } from "@prisma/client"
import { db } from "@/lib/db"

export async function syncGitHub(platform: Platform, user: User) {
  try {
    // Find the user's GitHub account
    const account = await db.account.findFirst({
      where: {
        userId: user.id,
        provider: "github",
      },
    })

    if (!account || !account.access_token) {
      console.error("No GitHub account found for user")
      return
    }

    // Fetch starred repositories
    const starredRepos = await fetchGitHubStarredRepos(account.access_token)

    // Fetch saved gists
    const gists = await fetchGitHubGists(account.access_token)

    // Process starred repositories
    for (const repo of starredRepos) {
      await saveGitHubRepo(repo, platform.id, user.id)
    }

    // Process gists
    for (const gist of gists) {
      await saveGitHubGist(gist, platform.id, user.id)
    }

    // Update last synced timestamp
    await db.platform.update({
      where: { id: platform.id },
      data: { lastSynced: new Date() },
    })

    return true
  } catch (error) {
    console.error("Error syncing GitHub content:", error)

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

async function fetchGitHubStarredRepos(accessToken: string) {
  const response = await fetch("https://api.github.com/user/starred?per_page=100", {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }

  return await response.json()
}

async function fetchGitHubGists(accessToken: string) {
  const response = await fetch("https://api.github.com/gists", {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }

  return await response.json()
}

async function saveGitHubRepo(repo: any, platformId: string, userId: string) {
  if (!repo.id || !repo.full_name) return

  // Check if the repo already exists
  const existingRepo = await db.savedItem.findUnique({
    where: {
      externalId_platformId: {
        externalId: `repo_${repo.id}`,
        platformId: platformId,
      },
    },
  })

  if (!existingRepo) {
    // Create a new saved item
    await db.savedItem.create({
      data: {
        externalId: `repo_${repo.id}`,
        title: repo.full_name,
        description: repo.description || `Repository by ${repo.owner.login}`,
        url: repo.html_url,
        thumbnailUrl: repo.owner.avatar_url,
        contentType: "github_repo",
        platformId: platformId,
        userId: userId,
        tags: {
          connectOrCreate: [
            {
              where: { name: "starred" },
              create: { name: "starred" },
            },
            {
              where: { name: "github" },
              create: { name: "github" },
            },
          ],
        },
      },
    })
  }
}

async function saveGitHubGist(gist: any, platformId: string, userId: string) {
  if (!gist.id) return

  // Get the first file name as the title
  const fileName = Object.keys(gist.files)[0] || "Untitled Gist"

  // Check if the gist already exists
  const existingGist = await db.savedItem.findUnique({
    where: {
      externalId_platformId: {
        externalId: `gist_${gist.id}`,
        platformId: platformId,
      },
    },
  })

  if (!existingGist) {
    // Create a new saved item
    await db.savedItem.create({
      data: {
        externalId: `gist_${gist.id}`,
        title: fileName,
        description: gist.description || "No description provided",
        url: gist.html_url,
        thumbnailUrl: gist.owner?.avatar_url,
        contentType: "github_gist",
        platformId: platformId,
        userId: userId,
        tags: {
          connectOrCreate: [
            {
              where: { name: "gist" },
              create: { name: "gist" },
            },
            {
              where: { name: "github" },
              create: { name: "github" },
            },
          ],
        },
      },
    })
  }
}
