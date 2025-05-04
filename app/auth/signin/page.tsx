import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-options"
import { SignInForm } from "@/components/auth/signin-form"

export default async function SignInPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to SaveCon</h1>
          <p className="text-sm text-muted-foreground">Connect your accounts to start saving content</p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
