import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/features/auth/server'
import { getLeadById } from '@/features/leads'
import { getPlans, SaleForm } from '@/features/sales'
import { getOperators } from '@/features/operators'
import { Button } from '@/components/ui/button'

export default async function NewSalePage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>
}) {
  const { leadId } = await searchParams
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!leadId) {
    redirect('/dashboard/leads')
  }

  const [lead, plans, operators] = await Promise.all([
    getLeadById(leadId, session!.user.id),
    getPlans(),
    getOperators(),
  ])

  if (!lead) {
    redirect('/dashboard/leads')
  }

  if (lead.status === 'converted') {
    redirect('/dashboard/sales')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/leads">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Nueva venta</h1>
          <p className="text-sm text-muted-foreground">
            Convertir lead: {lead.fullName}
          </p>
        </div>
      </div>

      <SaleForm lead={lead} plans={plans} operators={operators} />
    </div>
  )
}
