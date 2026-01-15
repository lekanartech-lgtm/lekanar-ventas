import {
  getAllAgencies,
  AgenciesTable,
  CreateAgencyDialog,
} from '@/features/agencies'

export default async function SettingsPage() {
  const agencies = await getAllAgencies()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuraciones</h1>
          <p className="text-muted-foreground">
            Gestiona las agencias de tu empresa
          </p>
        </div>
        <CreateAgencyDialog />
      </div>

      <AgenciesTable agencies={agencies} />
    </div>
  )
}
