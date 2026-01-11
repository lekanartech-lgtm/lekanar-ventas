import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users, FileText, ShoppingCart, TrendingUp } from 'lucide-react'
import { auth } from '@/features/auth/server'
import { getTeamStatsBySupervisor } from '@/features/supervisors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SupervisorDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || session.user.role !== 'supervisor') {
    redirect('/dashboard')
  }

  const stats = await getTeamStatsBySupervisor(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi Equipo</h1>
        <p className="text-muted-foreground">
          Resumen de actividad de tu equipo
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/dashboard/supervisor/team">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asesores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">en tu equipo</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/supervisor/leads">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newLeadsToday} hoy
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/supervisor/sales">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">totales</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.salesThisMonth}</div>
            <p className="text-xs text-muted-foreground">ventas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
