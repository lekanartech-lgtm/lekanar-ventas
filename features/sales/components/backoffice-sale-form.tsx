'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { backofficeUpdateSale, type BackofficeUpdateData } from '../actions'
import { REQUEST_STATUS_CONFIG, ORDER_STATUS_CONFIG } from '../constants'
import type { Sale, RequestStatus, OrderStatus } from '../types'

type BackofficeSale = Sale & { userName?: string }

type FormState = {
  error?: string
  success?: boolean
}

export function BackofficeSaleForm({ sale }: { sale: BackofficeSale }) {
  const router = useRouter()

  async function handleSubmit(
    _prevState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    const data: BackofficeUpdateData = {}

    const score = formData.get('score') as string
    if (score !== '') {
      data.score = parseInt(score)
    }

    const externalId = formData.get('externalId') as string
    if (externalId !== (sale.externalId || '')) {
      data.externalId = externalId || null
    }

    const contractNumber = formData.get('contractNumber') as string
    if (contractNumber !== (sale.contractNumber || '')) {
      data.contractNumber = contractNumber || null
    }

    const requestStatus = formData.get('requestStatus') as string
    if (requestStatus !== sale.requestStatus) {
      data.requestStatus = requestStatus
    }

    const orderStatus = formData.get('orderStatus') as string
    if (orderStatus !== sale.orderStatus) {
      data.orderStatus = orderStatus
    }

    const rejectionReason = formData.get('rejectionReason') as string
    if (rejectionReason !== (sale.rejectionReason || '')) {
      data.rejectionReason = rejectionReason || null
    }

    const installationDate = formData.get('installationDate') as string
    const currentInstallationDate = sale.installationDate
      ? new Date(sale.installationDate).toISOString().split('T')[0]
      : ''
    if (installationDate !== currentInstallationDate) {
      data.installationDate = installationDate || null
    }

    if (Object.keys(data).length === 0) {
      return { error: 'No hay cambios para guardar' }
    }

    const result = await backofficeUpdateSale(sale.id, data)

    if (result.error) {
      return { error: result.error }
    }

    router.refresh()
    return { success: true }
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, {})

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Datos de validación (Backoffice)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                name="score"
                type="number"
                min="0"
                max="999"
                defaultValue={sale.score ?? ''}
                placeholder="Ingrese score"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installationDate">Fecha de instalación</Label>
              <Input
                id="installationDate"
                name="installationDate"
                type="date"
                defaultValue={
                  sale.installationDate
                    ? new Date(sale.installationDate)
                        .toISOString()
                        .split('T')[0]
                    : ''
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="externalId">ID Externo</Label>
              <Input
                id="externalId"
                name="externalId"
                defaultValue={sale.externalId || ''}
                placeholder="ID del sistema del operador"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractNumber">N° Contrato</Label>
              <Input
                id="contractNumber"
                name="contractNumber"
                defaultValue={sale.contractNumber || ''}
                placeholder="Ej: C-2024-0001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestStatus">Estado del pedido</Label>
              <Select name="requestStatus" defaultValue={sale.requestStatus}>
                <SelectTrigger id="requestStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(REQUEST_STATUS_CONFIG) as [
                      RequestStatus,
                      { label: string },
                    ][]
                  ).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderStatus">Estado de la orden</Label>
              <Select name="orderStatus" defaultValue={sale.orderStatus}>
                <SelectTrigger id="orderStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(ORDER_STATUS_CONFIG) as [
                      OrderStatus,
                      { label: string },
                    ][]
                  ).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Motivo de rechazo</Label>
            <Textarea
              id="rejectionReason"
              name="rejectionReason"
              defaultValue={sale.rejectionReason || ''}
              placeholder="Completar solo si el pedido fue rechazado..."
              rows={2}
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          {state.success && (
            <p className="text-sm text-green-600">
              Cambios guardados correctamente
            </p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
