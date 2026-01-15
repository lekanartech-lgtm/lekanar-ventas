import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import {
  getLeadByIdForAdmin,
  getReferralSources,
  getStates,
} from '@/features/leads'
import { AdminLeadForm } from '@/features/leads/components/admin-lead-form'
import { getOperators } from '@/features/operators'
import { Button } from '@/components/ui/button'

export default async function AdminEditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [lead, referralSources, operators, states] = await Promise.all([
    getLeadByIdForAdmin(id),
    getReferralSources(),
    getOperators(),
    getStates(),
  ])

  if (!lead) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/leads">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Editar lead</h1>
          <p className="text-sm text-muted-foreground">
            {lead.fullName} - Asesor: {lead.userName || 'Sin asignar'}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <AdminLeadForm
          lead={lead}
          referralSources={referralSources}
          operators={operators}
          states={states}
        />
      </div>
    </div>
  )
}
