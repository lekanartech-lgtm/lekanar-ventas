import {
  getAllAgencies,
  AgenciesTable,
  CreateAgencyDialog,
} from '@/features/agencies'
import { getStates } from '@/features/leads'
import { PageHeader } from '@/components/page-header'

export default async function SettingsPage() {
  const [agencies, states] = await Promise.all([
    getAllAgencies(),
    getStates(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuraciones"
        description="Gestiona las agencias de tu empresa"
      >
        <CreateAgencyDialog states={states} />
      </PageHeader>

      <AgenciesTable agencies={agencies} states={states} />
    </div>
  )
}
