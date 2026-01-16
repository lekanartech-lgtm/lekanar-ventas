import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { auth } from '@/features/auth/server'
import { getAgendaByUserId, ContactAgendaFull } from '@/features/agenda'

export default async function AgendaPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  const agenda = await getAgendaByUserId(session.user.id)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Agenda de Contactos</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('es-PE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
      </div>

      <ContactAgendaFull agenda={agenda} />
    </div>
  )
}
