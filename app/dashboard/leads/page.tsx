import { headers } from 'next/headers'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { auth } from '@/features/auth/server'
import { getLeadsByUserId, LeadsTable, LeadsCardList } from '@/features/leads'
import { Button } from '@/components/ui/button'

export default async function LeadsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const leads = await getLeadsByUserId(session!.user.id)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis leads</h1>
          <p className="text-sm text-muted-foreground">
            {leads.length} {leads.length === 1 ? 'lead' : 'leads'} registrados
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/leads/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo
          </Link>
        </Button>
      </div>

      {/* Desktop: Table view */}
      <div className="hidden md:block">
        <LeadsTable leads={leads} />
      </div>

      {/* Mobile: Card list view */}
      <div className="md:hidden">
        <LeadsCardList leads={leads} />
      </div>
    </div>
  )
}
