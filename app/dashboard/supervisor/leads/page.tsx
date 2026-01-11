import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/features/auth/server'
import { getLeadsBySupervisor, LeadsTable, LeadsCardList } from '@/features/leads'
import { Button } from '@/components/ui/button'

export default async function SupervisorLeadsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || session.user.role !== 'supervisor') {
    redirect('/dashboard')
  }

  const leads = await getLeadsBySupervisor(session.user.id)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/supervisor">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Leads del Equipo</h1>
          <p className="text-sm text-muted-foreground">
            {leads.length} leads registrados
          </p>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <LeadsTable leads={leads} />
      </div>

      {/* Mobile card list */}
      <div className="md:hidden">
        <LeadsCardList leads={leads} />
      </div>
    </div>
  )
}
