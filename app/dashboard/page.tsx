import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ContentList } from "@/components/dashboard/content-list"
import { PlatformConnector } from "@/components/dashboard/platform-connector"
import { SearchBar } from "@/components/dashboard/search-bar"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const platforms = await db.platform.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
  })

  // Build the query for saved items
  const query: any = {
    where: {
      userId: session.user.id,
    },
    include: {
      platform: true,
      reminders: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  }

  // Add search filter if query parameter exists
  if (searchParams.q) {
    query.where.OR = [
      {
        title: {
          contains: searchParams.q,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: searchParams.q,
          mode: "insensitive",
        },
      },
    ]
  }

  const savedItems = await db.savedItem.findMany(query)

  return (
    <div className="container py-8">
      <DashboardHeader />

      <div className="mt-6 flex justify-between items-center">
        <SearchBar />
        {searchParams.q && (
          <div className="text-sm text-muted-foreground">
            Found {savedItems.length} results for "{searchParams.q}"
          </div>
        )}
      </div>

      {platforms.length === 0 ? (
        <div className="mt-8">
          <PlatformConnector userId={session.user.id} />
        </div>
      ) : (
        <div className="mt-8">
          <ContentList items={savedItems} />
        </div>
      )}
    </div>
  )
}
