import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { connectPlatform } from "@/app/actions/connect-platform"

interface PlatformConnectorProps {
  userId: string
}

export function PlatformConnector({ userId }: PlatformConnectorProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>YouTube</CardTitle>
          <CardDescription>Connect your YouTube account to sync saved videos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We'll import your Watch Later playlist and any videos you've liked.
          </p>
        </CardContent>
        <CardFooter>
          <form action={connectPlatform}>
            <input type="hidden" name="platform" value="youtube" />
            <input type="hidden" name="userId" value={userId} />
            <Button type="submit">Connect YouTube</Button>
          </form>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Twitter</CardTitle>
          <CardDescription>Connect your Twitter account to sync bookmarks</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">We'll import your bookmarked tweets and liked content.</p>
        </CardContent>
        <CardFooter>
          <form action={connectPlatform}>
            <input type="hidden" name="platform" value="twitter" />
            <input type="hidden" name="userId" value={userId} />
            <Button type="submit">Connect Twitter</Button>
          </form>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GitHub</CardTitle>
          <CardDescription>Connect your GitHub account to sync starred repos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">We'll import your starred repositories and gists.</p>
        </CardContent>
        <CardFooter>
          <form action={connectPlatform}>
            <input type="hidden" name="platform" value="github" />
            <input type="hidden" name="userId" value={userId} />
            <Button type="submit">Connect GitHub</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
