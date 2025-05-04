import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { User } from "next-auth"
import { updateProfile } from "@/app/actions/update-profile"

interface ProfileSettingsProps {
  user: User
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your profile information.</CardDescription>
      </CardHeader>
      <form action={updateProfile}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={user.name || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" defaultValue={user.email || ""} disabled />
            <p className="text-xs text-muted-foreground">Your email is managed by your authentication provider.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
