'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/app/lib/auth-client'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Button variant="destructive" onClick={handleSignOut}>
      Cerrar Sesión
    </Button>
  )
}
