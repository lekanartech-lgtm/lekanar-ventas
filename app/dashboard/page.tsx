import { headers } from 'next/headers'
import Link from 'next/link'
import { Users, ShoppingCart, Plus, TrendingUp } from 'lucide-react'
import { auth } from '@/features/auth/server'
import { getLeadsByUserId } from '@/features/leads'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const leads = await getLeadsByUserId(session!.user.id)
  const newLeads = leads.filter((l) => l.status === 'new')
  const convertedLeads = leads.filter((l) => l.status === 'converted')

  const stats = [
    {
      title: 'Leads activos',
      value: newLeads.length,
      icon: Users,
      href: '/dashboard/leads',
    },
    {
      title: 'Ventas',
      value: convertedLeads.length,
      icon: ShoppingCart,
      href: '/dashboard/sales',
    },
    {
      title: 'Conversión',
      value:
        leads.length > 0
          ? `${Math.round((convertedLeads.length / leads.length) * 100)}%`
          : '0%',
      icon: TrendingUp,
      href: '/dashboard/leads',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Hola, {session!.user.name?.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">¿Qué vas a hacer hoy?</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="h-full hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <stat.icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard/leads/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo lead
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/dashboard/leads">
              <Users className="mr-2 h-4 w-4" />
              Ver mis leads
            </Link>
          </Button>
        </CardContent>
      </Card>

      {newLeads.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Leads recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {newLeads.slice(0, 3).map((lead) => (
              <Link
                key={lead.id}
                href={`/dashboard/leads/${lead.id}/edit`}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div>
                  <p className="font-medium">{lead.fullName}</p>
                  <p className="text-sm text-muted-foreground">{lead.phone}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(lead.createdAt).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
