'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, MapPin } from 'lucide-react'
import { createSale, updateSale } from '../actions'
import { ADDRESS_TYPE_CONFIG, DEPARTMENTS } from '../constants'
import type { Sale, SaleFormData, Plan, AddressType } from '../types'
import type { Lead } from '@/features/leads'

type SaleFormProps = {
  sale?: Sale
  lead?: Lead
  plans: Plan[]
}

export function SaleForm({ sale, lead, plans }: SaleFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [isPhoneOwner, setIsPhoneOwner] = useState(
    sale ? !sale.phoneOwnerName : true
  )
  const [selectedPlanId, setSelectedPlanId] = useState(sale?.planId || '')
  const [price, setPrice] = useState(sale?.price?.toString() || '')

  const isEditing = !!sale

  function handlePlanChange(planId: string) {
    setSelectedPlanId(planId)
    const plan = plans.find((p) => p.id === planId)
    if (plan) {
      setPrice(plan.price.toString())
    }
  }

  async function handleGetLocation() {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latInput = document.getElementById('latitude') as HTMLInputElement
        const lngInput = document.getElementById('longitude') as HTMLInputElement
        if (latInput && lngInput) {
          latInput.value = position.coords.latitude.toFixed(8)
          lngInput.value = position.coords.longitude.toFixed(8)
        }
      },
      (error) => {
        alert('No se pudo obtener la ubicación: ' + error.message)
      }
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    const data: SaleFormData = {
      leadId: lead?.id,
      fullName: formData.get('fullName') as string,
      dni: formData.get('dni') as string,
      dniExpiryDate: formData.get('dniExpiryDate') as string,
      birthPlace: formData.get('birthPlace') as string,
      birthDate: formData.get('birthDate') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      isPhoneOwner,
      phoneOwnerName: formData.get('phoneOwnerName') as string,
      phoneOwnerDni: formData.get('phoneOwnerDni') as string,
      address: formData.get('address') as string,
      addressType: formData.get('addressType') as AddressType,
      reference: formData.get('reference') as string,
      district: formData.get('district') as string,
      province: formData.get('province') as string,
      department: formData.get('department') as string,
      latitude: formData.get('latitude') as string,
      longitude: formData.get('longitude') as string,
      planId: formData.get('planId') as string,
      price: formData.get('price') as string,
      score: formData.get('score') as string,
      installationDate: formData.get('installationDate') as string,
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateSale(sale.id, data)
        : await createSale(data)

      if (result.error) {
        setError(result.error)
        return
      }

      router.push('/dashboard/sales')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Datos personales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Datos del cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre completo *</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={sale?.fullName || lead?.fullName}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                name="dni"
                defaultValue={sale?.dni || lead?.dni}
                maxLength={8}
                required
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dniExpiryDate">Vencimiento DNI *</Label>
              <Input
                id="dniExpiryDate"
                name="dniExpiryDate"
                type="date"
                defaultValue={
                  sale?.dniExpiryDate
                    ? new Date(sale.dniExpiryDate).toISOString().split('T')[0]
                    : ''
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthPlace">Lugar de nacimiento</Label>
              <Input
                id="birthPlace"
                name="birthPlace"
                defaultValue={sale?.birthPlace || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de nacimiento</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                defaultValue={
                  sale?.birthDate
                    ? new Date(sale.birthDate).toISOString().split('T')[0]
                    : ''
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={sale?.phone || lead?.phone}
                required
                inputMode="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={sale?.email || ''}
                inputMode="email"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Titular de línea */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Titular de la línea</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isPhoneOwner"
              checked={isPhoneOwner}
              onCheckedChange={(checked) => setIsPhoneOwner(checked as boolean)}
            />
            <Label htmlFor="isPhoneOwner" className="font-normal">
              El cliente es titular de la línea telefónica
            </Label>
          </div>

          {!isPhoneOwner && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneOwnerName">Nombre del titular *</Label>
                <Input
                  id="phoneOwnerName"
                  name="phoneOwnerName"
                  defaultValue={sale?.phoneOwnerName || ''}
                  required={!isPhoneOwner}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneOwnerDni">DNI del titular *</Label>
                <Input
                  id="phoneOwnerDni"
                  name="phoneOwnerDni"
                  defaultValue={sale?.phoneOwnerDni || ''}
                  maxLength={8}
                  required={!isPhoneOwner}
                  inputMode="numeric"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dirección */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dirección de instalación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Dirección completa *</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={sale?.address || ''}
              placeholder="Calle, número, urbanización, etc."
              required
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressType">Tipo de domicilio *</Label>
            <Select
              name="addressType"
              defaultValue={sale?.addressType || 'home'}
            >
              <SelectTrigger id="addressType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ADDRESS_TYPE_CONFIG).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referencia</Label>
            <Input
              id="reference"
              name="reference"
              defaultValue={sale?.reference || ''}
              placeholder="Ej: Frente al parque"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Departamento *</Label>
              <Select
                name="department"
                defaultValue={sale?.department || 'Lima'}
              >
                <SelectTrigger id="department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Provincia *</Label>
              <Input
                id="province"
                name="province"
                defaultValue={sale?.province || ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Distrito *</Label>
              <Input
                id="district"
                name="district"
                defaultValue={sale?.district || ''}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Coordenadas GPS</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Obtener ubicación
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="latitude"
                name="latitude"
                placeholder="Latitud"
                defaultValue={sale?.latitude?.toString() || ''}
              />
              <Input
                id="longitude"
                name="longitude"
                placeholder="Longitud"
                defaultValue={sale?.longitude?.toString() || ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan y servicio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Plan contratado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="planId">Plan *</Label>
            <Select
              name="planId"
              value={selectedPlanId}
              onValueChange={handlePlanChange}
            >
              <SelectTrigger id="planId">
                <SelectValue placeholder="Seleccionar plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - S/.{plan.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio mensual (S/.) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Score (0-999)</Label>
              <Input
                id="score"
                name="score"
                type="number"
                min="0"
                max="999"
                defaultValue={sale?.score?.toString() || ''}
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="installationDate">Fecha de instalación</Label>
            <Input
              id="installationDate"
              name="installationDate"
              type="date"
              defaultValue={
                sale?.installationDate
                  ? new Date(sale.installationDate).toISOString().split('T')[0]
                  : ''
              }
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? 'Guardando...' : 'Registrando venta...'}
          </>
        ) : isEditing ? (
          'Guardar cambios'
        ) : (
          'Registrar venta'
        )}
      </Button>
    </form>
  )
}
