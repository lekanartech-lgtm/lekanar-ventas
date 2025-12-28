import Link from 'next/link'
import { headers } from 'next/headers'
import { auth } from './lib/auth'
import { SignOutButton } from './components/sign-out-button'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        {session ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">
                Bienvenido, {session.user.name}
              </CardTitle>
              <CardDescription>
                Has iniciado sesión como {session.user.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignOutButton />
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">
                Plataforma de Gestión ISP
              </CardTitle>
              <CardDescription>
                Inicia sesión para gestionar tus leads y ventas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/sign-in">Iniciar Sesión</Link>
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
