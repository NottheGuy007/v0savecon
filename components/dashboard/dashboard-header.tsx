import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { syncContent } from "@/app/actions/sync-content"

export function DashboardHeader() {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Saved Content</h2>
        <p className="text-muted-foreground">Manage all your saved content from different platforms.</p>
      </div>
      <div className="flex items-center space-x-2">
        <form action={syncContent}>
          <Button type="submit" variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Now
          </Button>
        </form>
        <Button asChild size="sm">
          <Link href="/settings/platforms">
            <PlusCircle className="mr-2 h-4 w-4" />
            Connect Platform
          </Link>
        </Button>
      </div>
    </div>
  )
}
