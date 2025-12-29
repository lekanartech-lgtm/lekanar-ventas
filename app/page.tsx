import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/features/auth/server'
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

  if (session) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            ISP
          </div>
          <CardTitle className="text-2xl">Gestión ISP</CardTitle>
          <CardDescription>
            Plataforma de gestión de leads y ventas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/sign-in">Iniciar Sesión</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
