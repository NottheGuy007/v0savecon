import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ExternalLink, Youtube, Twitter, Github } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import type { SavedItem, Platform, Reminder } from "@prisma/client"
import { createReminder } from "@/app/actions/create-reminder"

type SavedItemWithRelations = SavedItem & {
  platform: Platform
  reminders: Reminder[]
}

interface ContentListProps {
  items: SavedItemWithRelations[]
}

export function ContentList({ items }: ContentListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium">No saved content yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your platforms and start saving content to see it here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <Badge variant="outline" className="mb-2 flex items-center gap-1">
                {getPlatformIcon(item.contentType)}
                {item.platform.name}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </div>
            <CardTitle className="line-clamp-2">{item.title}</CardTitle>
            <CardDescription className="line-clamp-2">{item.description || "No description available"}</CardDescription>
          </CardHeader>
          <CardContent>
            {item.thumbnailUrl && (
              <div className="aspect-video overflow-hidden rounded-md mb-4">
                <img
                  src={item.thumbnailUrl || "/placeholder.svg"}
                  alt={item.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <form action={createReminder}>
              <input type="hidden" name="savedItemId" value={item.id} />
              <Button type="submit" variant="ghost" size="sm" disabled={item.reminders.length > 0}>
                <Clock className="mr-2 h-4 w-4" />
                {item.reminders.length > 0 ? "Reminder Set" : "Remind Me"}
              </Button>
            </form>
            <Button asChild variant="ghost" size="sm">
              <Link href={item.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function getPlatformIcon(contentType: string) {
  if (contentType.startsWith("youtube")) {
    return <Youtube className="h-3 w-3 mr-1" />
  } else if (contentType.startsWith("twitter")) {
    return <Twitter className="h-3 w-3 mr-1" />
  } else if (contentType.startsWith("github")) {
    return <Github className="h-3 w-3 mr-1" />
  }
  return null
}
