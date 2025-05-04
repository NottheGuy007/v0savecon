import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-12">
      <div className="space-y-6 text-center">
        <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl">All your saved content in one place</h1>
        <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          SaveCon connects to your favorite platforms and brings all your saved content together, organized and
          accessible.
        </p>
        <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
          <Button asChild size="lg">
            <Link href="/auth/signin">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Connect Platforms</CardTitle>
            <CardDescription>Link your accounts from YouTube, Twitter, Reddit and more</CardDescription>
          </CardHeader>
          <CardContent>
            Connect once and SaveCon will automatically sync your saved content across all platforms.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unified Library</CardTitle>
            <CardDescription>All your content in one searchable database</CardDescription>
          </CardHeader>
          <CardContent>No more switching between apps to find that article or video you saved last week.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Smart Reminders</CardTitle>
            <CardDescription>Never forget to revisit important content</CardDescription>
          </CardHeader>
          <CardContent>
            Set reminders for content you want to revisit later and get notified at the right time.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
