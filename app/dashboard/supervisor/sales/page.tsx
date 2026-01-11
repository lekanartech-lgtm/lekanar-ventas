import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/features/auth/server'
import { getSalesBySupervisor, SalesTable, SalesCardList } from '@/features/sales'
import { Button } from '@/components/ui/button'

export default async function SupervisorSalesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || session.user.role !== 'supervisor') {
    redirect('/dashboard')
  }

  const sales = await getSalesBySupervisor(session.user.id)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/supervisor">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">Ventas del Equipo</h1>
          <p className="text-sm text-muted-foreground">
            {sales.length} ventas registradas
          </p>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <SalesTable sales={sales} />
      </div>

      {/* Mobile card list */}
      <div className="md:hidden">
        <SalesCardList sales={sales} />
      </div>
    </div>
  )
}
