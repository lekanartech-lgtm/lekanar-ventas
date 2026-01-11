import { headers } from 'next/headers'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { auth } from '@/features/auth/server'
import { getSalesByUserId, SalesTable, SalesCardList } from '@/features/sales'
import { Button } from '@/components/ui/button'

export default async function SalesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const sales = await getSalesByUserId(session!.user.id)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis ventas</h1>
          <p className="text-sm text-muted-foreground">
            {sales.length} {sales.length === 1 ? 'venta' : 'ventas'} registradas
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/leads">
            <Plus className="mr-2 h-4 w-4" />
            Desde lead
          </Link>
        </Button>
      </div>

      {/* Desktop: Table view */}
      <div className="hidden md:block">
        <SalesTable sales={sales} />
      </div>

      {/* Mobile: Card list view */}
      <div className="md:hidden">
        <SalesCardList sales={sales} />
      </div>
    </div>
  )
}
