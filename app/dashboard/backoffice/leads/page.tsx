import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/features/auth/server'
import { getAllLeads } from '@/features/leads'
import { BackofficeLeadsTable } from '@/features/leads/components/backoffice-leads-table'

export default async function BackofficeLeadsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !['backoffice', 'admin'].includes(session.user.role || '')) {
    redirect('/dashboard')
  }

  const leads = await getAllLeads()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Todos los leads</h1>
        <p className="text-sm text-muted-foreground">
          {leads.length} leads registrados
        </p>
      </div>

      <BackofficeLeadsTable leads={leads} />
    </div>
  )
}
