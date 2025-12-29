import { headers } from 'next/headers'
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react'
import { auth } from '@/features/auth/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminPage() {
  const response = await auth.api.listUsers({
    headers: await headers(),
    query: {},
  })

  const users = response.users
  const totalUsers = users.length
  const activeUsers = users.filter((u) => !u.banned).length
  const bannedUsers = users.filter((u) => u.banned).length

  const stats = [
    {
      title: 'Total Usuarios',
      value: totalUsers,
      icon: Users,
      description: 'Usuarios registrados',
    },
    {
      title: 'Usuarios Activos',
      value: activeUsers,
      icon: UserCheck,
      description: 'Pueden acceder al sistema',
    },
    {
      title: 'Usuarios Suspendidos',
      value: bannedUsers,
      icon: UserX,
      description: 'Acceso restringido',
    },
    {
      title: 'Tasa de Actividad',
      value: totalUsers > 0 ? `${Math.round((activeUsers / totalUsers) * 100)}%` : '0%',
      icon: TrendingUp,
      description: 'Usuarios activos vs total',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del sistema
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
