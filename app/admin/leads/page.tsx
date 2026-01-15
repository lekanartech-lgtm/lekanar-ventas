import { getAllLeads } from '@/features/leads'
import { AdminLeadsTable } from '@/features/leads/components/admin-leads-table'
import { PageHeader } from '@/components/page-header'

export default async function AdminLeadsPage() {
  const leads = await getAllLeads()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description={`${leads.length} leads registrados por los asesores`}
      />

      <AdminLeadsTable leads={leads} />
    </div>
  )
}
