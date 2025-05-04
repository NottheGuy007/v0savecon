import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlatformSettings } from "@/components/settings/platform-settings"
import { ProfileSettings } from "@/components/settings/profile-settings"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const platforms = await db.platform.findMany({
    where: {
      userId: session.user.id,
    },
  })

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and connected platforms.</p>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="platforms">
          <TabsList>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="platforms" className="mt-4">
            <PlatformSettings platforms={platforms} />
          </TabsContent>
          <TabsContent value="profile" className="mt-4">
            <ProfileSettings user={session.user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
