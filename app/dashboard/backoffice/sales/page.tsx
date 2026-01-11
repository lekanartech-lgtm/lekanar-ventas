import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/features/auth/server'
import { getAllSales } from '@/features/sales'
import { BackofficeSalesTable } from '@/features/sales/components/backoffice-sales-table'

export default async function BackofficeSalesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !['backoffice', 'admin'].includes(session.user.role || '')) {
    redirect('/dashboard')
  }

  const sales = await getAllSales()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Todas las ventas</h1>
        <p className="text-sm text-muted-foreground">
          {sales.length} ventas registradas
        </p>
      </div>

      <BackofficeSalesTable sales={sales} />
    </div>
  )
}
