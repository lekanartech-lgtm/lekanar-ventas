import {
  getAllAgencies,
  AgenciesTable,
  CreateAgencyDialog,
} from '@/features/agencies'
import {
  getAllOperators,
  OperatorsTable,
  CreateOperatorDialog,
} from '@/features/operators'
import { getStates } from '@/features/leads'
import { PageHeader } from '@/components/page-header'

export default async function SettingsPage() {
  const [agencies, operators, states] = await Promise.all([
    getAllAgencies(),
    getAllOperators(),
    getStates(),
  ])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configuraciones"
        description="Gestiona las agencias y operadores de tu empresa"
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Agencias</h2>
            <p className="text-sm text-muted-foreground">
              Administra las agencias asociadas a tu empresa
            </p>
          </div>
          <CreateAgencyDialog states={states} />
        </div>
        <AgenciesTable agencies={agencies} states={states} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Operadores</h2>
            <p className="text-sm text-muted-foreground">
              Administra los operadores disponibles para tus leads
            </p>
          </div>
          <CreateOperatorDialog />
        </div>
        <OperatorsTable operators={operators} />
      </section>
    </div>
  )
}
