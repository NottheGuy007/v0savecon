import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { Platform } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import { togglePlatform } from "@/app/actions/toggle-platform"

interface PlatformSettingsProps {
  platforms: Platform[]
}

export function PlatformSettings({ platforms }: PlatformSettingsProps) {
  if (platforms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
          <CardDescription>You haven't connected any platforms yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect platforms from the dashboard to start syncing your saved content.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <a href="/dashboard">Go to Dashboard</a>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
          <CardDescription>Manage your connected platforms and sync settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platforms.map((platform) => (
              <div key={platform.id} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium capitalize">{platform.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {platform.lastSynced
                      ? `Last synced ${formatDistanceToNow(new Date(platform.lastSynced), { addSuffix: true })}`
                      : "Never synced"}
                  </div>
                </div>
                <form action={togglePlatform}>
                  <input type="hidden" name="platformId" value={platform.id} />
                  <Switch
                    name="isActive"
                    checked={platform.isActive}
                    onCheckedChange={() => {
                      const form = document.createElement("form")
                      form.method = "post"
                      form.action = "/api/toggle-platform"
                      const input = document.createElement("input")
                      input.name = "platformId"
                      input.value = platform.id
                      form.appendChild(input)
                      document.body.appendChild(form)
                      form.submit()
                    }}
                  />
                </form>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
