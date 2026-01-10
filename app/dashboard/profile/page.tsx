'use client'

import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { signOut, useSession } from '@/features/auth/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function ProfilePage() {
  const router = useRouter()
  const { data: session } = useSession()

  const initials = session?.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleSignOut() {
    await signOut()
    router.push('/sign-in')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mi perfil</h1>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {initials || <User className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{session?.user.name}</p>
              <p className="text-sm text-muted-foreground">
                {session?.user.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
