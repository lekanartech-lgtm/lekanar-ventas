import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, MapPin, Phone, Mail, Calendar, User } from 'lucide-react'
import { auth } from '@/features/auth/server'
import { getSaleByIdForBackoffice } from '@/features/sales/queries'
import {
  RequestStatusBadge,
  OrderStatusBadge,
  ADDRESS_TYPE_CONFIG,
} from '@/features/sales'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BackofficeSaleForm } from '@/features/sales/components/backoffice-sale-form'

export default async function BackofficeSaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !['backoffice', 'admin'].includes(session.user.role || '')) {
    redirect('/dashboard')
  }

  const sale = await getSaleByIdForBackoffice(id)

  if (!sale) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/backoffice/sales">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{sale.fullName}</h1>
          <p className="text-sm text-muted-foreground">DNI: {sale.dni}</p>
        </div>
      </div>

      {/* Asesor */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Registrado por</p>
              <p className="font-medium">{sale.userName || 'Usuario desconocido'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estados actuales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estado actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Pedido</p>
              <RequestStatusBadge status={sale.requestStatus} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Orden</p>
              <OrderStatusBadge status={sale.orderStatus} />
            </div>
            {sale.score !== null && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Score</p>
                <span className="font-bold text-lg">{sale.score}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulario de edición backoffice */}
      <BackofficeSaleForm sale={sale} />

      {/* Contacto */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href={`tel:${sale.phone}`}
            className="flex items-center gap-2 text-primary"
          >
            <Phone className="h-4 w-4" />
            {sale.phone}
          </a>
          {sale.email && (
            <a
              href={`mailto:${sale.email}`}
              className="flex items-center gap-2 text-primary"
            >
              <Mail className="h-4 w-4" />
              {sale.email}
            </a>
          )}
        </CardContent>
      </Card>

      {/* Dirección */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dirección de instalación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>{sale.address}</p>
          <p className="text-sm text-muted-foreground">
            {sale.district}, {sale.province}, {sale.department}
          </p>
          <p className="text-sm text-muted-foreground">
            Tipo: {ADDRESS_TYPE_CONFIG[sale.addressType]}
          </p>
          {sale.reference && (
            <p className="text-sm text-muted-foreground">
              Ref: {sale.reference}
            </p>
          )}
          {sale.latitude && sale.longitude && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://maps.google.com/?q=${sale.latitude},${sale.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Ver en mapa
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Plan contratado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">{sale.planName}</span>
            <span className="font-bold">S/.{sale.price.toFixed(2)}</span>
          </div>
          {sale.operatorName && (
            <p className="text-sm text-muted-foreground">
              Operador: {sale.operatorName}
            </p>
          )}
          {sale.installationDate && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Instalación:{' '}
              {new Date(sale.installationDate).toLocaleDateString('es-PE')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Datos adicionales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Información adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Fecha vencimiento DNI:</span>{' '}
            {new Date(sale.dniExpiryDate).toLocaleDateString('es-PE')}
          </p>
          {sale.birthDate && (
            <p>
              <span className="text-muted-foreground">Fecha nacimiento:</span>{' '}
              {new Date(sale.birthDate).toLocaleDateString('es-PE')}
            </p>
          )}
          {sale.birthPlace && (
            <p>
              <span className="text-muted-foreground">Lugar nacimiento:</span>{' '}
              {sale.birthPlace}
            </p>
          )}
          {sale.phoneOwnerName && (
            <p>
              <span className="text-muted-foreground">Titular del teléfono:</span>{' '}
              {sale.phoneOwnerName} (DNI: {sale.phoneOwnerDni})
            </p>
          )}
          <p>
            <span className="text-muted-foreground">Registrado:</span>{' '}
            {new Date(sale.createdAt).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
