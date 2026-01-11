import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShoppingCart, Users, Clock, CheckCircle } from 'lucide-react'
import { auth } from '@/features/auth/server'
import { getAllLeads } from '@/features/leads'
import { getAllSales } from '@/features/sales'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function BackofficeDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !['backoffice', 'admin'].includes(session.user.role || '')) {
    redirect('/dashboard')
  }

  const [leads, sales] = await Promise.all([getAllLeads(), getAllSales()])

  const pendingSales = sales.filter((s) => s.requestStatus === 'pending')
  const validatedSales = sales.filter((s) => s.requestStatus === 'validated')
  const todaySales = sales.filter((s) => {
    const today = new Date()
    const saleDate = new Date(s.createdAt)
    return saleDate.toDateString() === today.toDateString()
  })

  const stats = [
    {
      title: 'Ventas pendientes',
      value: pendingSales.length,
      icon: Clock,
      href: '/dashboard/backoffice/sales?status=pending',
      color: 'text-yellow-600',
    },
    {
      title: 'Ventas validadas',
      value: validatedSales.length,
      icon: CheckCircle,
      href: '/dashboard/backoffice/sales?status=validated',
      color: 'text-green-600',
    },
    {
      title: 'Ventas hoy',
      value: todaySales.length,
      icon: ShoppingCart,
      href: '/dashboard/backoffice/sales',
      color: 'text-blue-600',
    },
    {
      title: 'Leads totales',
      value: leads.length,
      icon: Users,
      href: '/dashboard/backoffice/leads',
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Backoffice</h1>
        <p className="text-muted-foreground">
          Gestión de ventas y validaciones
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="h-full hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Ventas pendientes recientes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ventas pendientes de validar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingSales.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay ventas pendientes
            </p>
          ) : (
            pendingSales.slice(0, 5).map((sale) => (
              <Link
                key={sale.id}
                href={`/dashboard/backoffice/sales/${sale.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div>
                  <p className="font-medium">{sale.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {sale.userName} - {sale.operatorName || 'Sin operador'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{sale.planName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sale.createdAt).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </p>
                </div>
              </Link>
            ))
          )}
          {pendingSales.length > 5 && (
            <Link
              href="/dashboard/backoffice/sales?status=pending"
              className="block text-center text-sm text-primary hover:underline"
            >
              Ver todas ({pendingSales.length})
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
