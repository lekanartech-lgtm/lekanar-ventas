import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/features/auth/server'
import { BottomNav } from './bottom-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              W
            </div>
            <span className="font-semibold">WIN Sales</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {session.user.name?.split(' ')[0]}
            </span>
          </div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto p-4">{children}</main>

      <BottomNav />
    </div>
  )
}
