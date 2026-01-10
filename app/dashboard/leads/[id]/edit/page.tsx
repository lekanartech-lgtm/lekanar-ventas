import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/features/auth/server'
import { getLeadById, getReferralSources, LeadForm } from '@/features/leads'
import { Button } from '@/components/ui/button'

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const [lead, referralSources] = await Promise.all([
    getLeadById(id, session!.user.id),
    getReferralSources(),
  ])

  if (!lead) {
    notFound()
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
          <h1 className="text-xl font-bold">Editar lead</h1>
          <p className="text-sm text-muted-foreground">{lead.fullName}</p>
        </div>
      </div>

      <LeadForm lead={lead} referralSources={referralSources} />
    </div>
  )
}
