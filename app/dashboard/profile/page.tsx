import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { User } from 'lucide-react'
import { auth } from '@/features/auth/server'
import { ProfileForm } from '@/features/users'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SignOutButton } from './sign-out-button'

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  const initials = session.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg bg-primary/10 text-primary">
            {initials || <User className="h-6 w-6" />}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{session.user.name}</h1>
          <p className="text-muted-foreground">{session.user.email}</p>
        </div>
      </div>

      <ProfileForm
        user={{
          name: session.user.name,
          email: session.user.email,
        }}
      />

      <SignOutButton />
    </div>
  )
}
