import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getReferralSources, LeadForm } from '@/features/leads'
import { getOperators } from '@/features/operators'
import { Button } from '@/components/ui/button'

export default async function NewLeadPage() {
  const [referralSources, operators] = await Promise.all([
    getReferralSources(),
    getOperators(),
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/leads">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Nuevo lead</h1>
          <p className="text-sm text-muted-foreground">
            Registra un nuevo prospecto
          </p>
        </div>
      </div>

      <LeadForm referralSources={referralSources} operators={operators} />
    </div>
  )
}
