'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { createLead, updateLead } from '../actions'
import { TIME_PREFERENCES, OPERATORS } from '../constants'
import type { Lead, LeadFormData, ReferralSource } from '../types'
import type { Operator } from '@/features/operators'

type LeadFormProps = {
  lead?: Lead
  referralSources: ReferralSource[]
  operators: Operator[]
  preselectedOperatorId?: string
}

export function LeadForm({
  lead,
  referralSources,
  operators,
  preselectedOperatorId,
}: LeadFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const isEditing = !!lead
  // If we have a preselectedOperatorId, use it. Otherwise fall back to lead's operator or empty.
  const defaultOperatorId = preselectedOperatorId || lead?.operatorId || ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    // Ensure operatorId is included even if the select is disabled/hidden
    if (preselectedOperatorId && !formData.get('operatorId')) {
      formData.append('operatorId', preselectedOperatorId)
    }

    const data: LeadFormData = {
      fullName: formData.get('fullName') as string,
      dni: formData.get('dni') as string,
      phone: formData.get('phone') as string,
      contactDate: formData.get('contactDate') as string,
      contactTimePreference: formData.get('contactTimePreference') as string,
      referralSourceId: formData.get('referralSourceId') as string,
      currentOperator: formData.get('currentOperator') as string,
      notes: formData.get('notes') as string,
      operatorId: formData.get('operatorId') as string,
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateLead(lead.id, data)
        : await createLead(data)

      if (result.error) {
        setError(result.error)
        return
      }

      router.push('/dashboard/leads')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className={`space-y-2 ${preselectedOperatorId ? 'hidden' : ''}`}>
            <Label htmlFor="operatorId">Operador *</Label>
            <Select
              name="operatorId"
              defaultValue={defaultOperatorId}
              required
              disabled={!!preselectedOperatorId}
            >
              <SelectTrigger id="operatorId">
                <SelectValue placeholder="Seleccionar operador" />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op.id} value={op.id}>
                    {op.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Hidden input to ensure value is submitted if Select is disabled/hidden */}
            {preselectedOperatorId && (
              <input
                type="hidden"
                name="operatorId"
                value={preselectedOperatorId}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo *</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={lead?.fullName}
              placeholder="Ej: Juan Carlos Pérez García"
              required
              autoComplete="off"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                name="dni"
                defaultValue={lead?.dni}
                placeholder="12345678"
                maxLength={8}
                pattern="[0-9]{8}"
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={lead?.phone}
                placeholder="987654321"
                required
                inputMode="tel"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactDate">Fecha de contacto</Label>
              <Input
                id="contactDate"
                name="contactDate"
                type="date"
                defaultValue={
                  lead?.contactDate
                    ? new Date(lead.contactDate).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactTimePreference">Horario de llamada</Label>
              <Select
                name="contactTimePreference"
                defaultValue={lead?.contactTimePreference || ''}
              >
                <SelectTrigger id="contactTimePreference">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PREFERENCES.map((pref) => (
                    <SelectItem key={pref.value} value={pref.value}>
                      {pref.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referralSourceId">¿Cómo se enteró de WIN?</Label>
            <Select
              name="referralSourceId"
              defaultValue={lead?.referralSourceId || ''}
            >
              <SelectTrigger id="referralSourceId">
                <SelectValue placeholder="Seleccionar fuente" />
              </SelectTrigger>
              <SelectContent>
                {referralSources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentOperator">Operador actual</Label>
            <Select
              name="currentOperator"
              defaultValue={lead?.currentOperator || ''}
            >
              <SelectTrigger id="currentOperator">
                <SelectValue placeholder="Seleccionar operador" />
              </SelectTrigger>
              <SelectContent>
                {OPERATORS.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observaciones</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={lead?.notes || ''}
              placeholder="Notas adicionales sobre el prospecto..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? 'Guardando...' : 'Creando...'}
          </>
        ) : isEditing ? (
          'Guardar cambios'
        ) : (
          'Crear lead'
        )}
      </Button>
    </form>
  )
}
