import {
  getAllAgencies,
  AgenciesTable,
  CreateAgencyDialog,
} from '@/features/agencies'
import { PageHeader } from '@/components/page-header'

export default async function SettingsPage() {
  const agencies = await getAllAgencies()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuraciones"
        description="Gestiona las agencias de tu empresa"
      >
        <CreateAgencyDialog />
      </PageHeader>

      <AgenciesTable agencies={agencies} />
    </div>
  )
}
