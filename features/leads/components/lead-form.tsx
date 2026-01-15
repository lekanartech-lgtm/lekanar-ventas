'use client'

import { useState, useTransition, useEffect } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, MapPin } from 'lucide-react'
import {
  createLead,
  updateLead,
  fetchCitiesByState,
  fetchDistrictsByCity,
} from '../actions'
import { TIME_PREFERENCES, OPERATORS } from '../constants'
import type {
  Lead,
  LeadFormData,
  ReferralSource,
  State,
  City,
  District,
} from '../types'
import type { Operator } from '@/features/operators'

type LeadFormProps = {
  lead?: Lead
  referralSources: ReferralSource[]
  operators: Operator[]
  states: State[]
  preselectedOperatorId?: string
}

export function LeadForm({
  lead,
  referralSources,
  operators,
  states,
  preselectedOperatorId,
}: LeadFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [selectedStateId, setSelectedStateId] = useState(
    lead?.districtId?.slice(0, 2) || ''
  )
  const [selectedCityId, setSelectedCityId] = useState(
    lead?.districtId?.slice(0, 4) || ''
  )
  const [selectedDistrictId, setSelectedDistrictId] = useState(
    lead?.districtId || ''
  )
  const [cities, setCities] = useState<City[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)

  const [latitude, setLatitude] = useState(lead?.latitude?.toString() || '')
  const [longitude, setLongitude] = useState(lead?.longitude?.toString() || '')
  const [gettingLocation, setGettingLocation] = useState(false)

  const isEditing = !!lead
  const defaultOperatorId = preselectedOperatorId || lead?.operatorId || ''

  useEffect(() => {
    if (!lead?.districtId) return

    let cancelled = false
    const initialStateId = lead.districtId.slice(0, 2)
    const initialCityId = lead.districtId.slice(0, 4)

    async function loadInitialData() {
      if (initialStateId) {
        setLoadingCities(true)
        try {
          const citiesData = await fetchCitiesByState(initialStateId)
          if (!cancelled) setCities(citiesData)
        } catch (error) {
          console.error(error)
        } finally {
          if (!cancelled) setLoadingCities(false)
        }
      }

      if (initialCityId) {
        setLoadingDistricts(true)
        try {
          const districtsData = await fetchDistrictsByCity(initialCityId)
          if (!cancelled) setDistricts(districtsData)
        } catch (error) {
          console.error(error)
        } finally {
          if (!cancelled) setLoadingDistricts(false)
        }
      }
    }

    loadInitialData()

    return () => {
      cancelled = true
    }
  }, [lead])

  const handleStateChange = async (stateId: string) => {
    setSelectedStateId(stateId)
    setSelectedCityId('')
    setSelectedDistrictId('')
    setDistricts([])

    setLoadingCities(true)
    try {
      const data = await fetchCitiesByState(stateId)
      setCities(data)
    } catch (error) {
      console.error(error)
      setCities([])
    } finally {
      setLoadingCities(false)
    }
  }

  const handleCityChange = async (cityId: string) => {
    setSelectedCityId(cityId)
    setSelectedDistrictId('')

    setLoadingDistricts(true)
    try {
      const data = await fetchDistrictsByCity(cityId)
      setDistricts(data)
    } catch (error) {
      console.error(error)
      setDistricts([])
    } finally {
      setLoadingDistricts(false)
    }
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización')
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(8))
        setLongitude(position.coords.longitude.toFixed(8))
        setGettingLocation(false)
      },
      (err) => {
        setError('No se pudo obtener la ubicación: ' + err.message)
        setGettingLocation(false)
      },
      { enableHighAccuracy: true }
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
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
      address: formData.get('address') as string,
      stateId: selectedStateId,
      cityId: selectedCityId,
      districtId: selectedDistrictId,
      latitude,
      longitude,
      reference: formData.get('reference') as string,
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

      {/* Address Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dirección (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              name="address"
              defaultValue={lead?.address || ''}
              placeholder="Av. Principal 123, Urb. Las Flores"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stateId">Departamento</Label>
              <Select value={selectedStateId} onValueChange={handleStateChange}>
                <SelectTrigger id="stateId">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cityId">Provincia</Label>
              <Select
                value={selectedCityId}
                onValueChange={handleCityChange}
                disabled={!selectedStateId || loadingCities}
              >
                <SelectTrigger id="cityId">
                  <SelectValue
                    placeholder={loadingCities ? 'Cargando...' : 'Seleccionar'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="districtId">Distrito</Label>
              <Select
                value={selectedDistrictId}
                onValueChange={setSelectedDistrictId}
                disabled={!selectedCityId || loadingDistricts}
              >
                <SelectTrigger id="districtId">
                  <SelectValue
                    placeholder={
                      loadingDistricts ? 'Cargando...' : 'Seleccionar'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referencia</Label>
            <Input
              id="reference"
              name="reference"
              defaultValue={lead?.reference || ''}
              placeholder="Frente al parque, casa color azul..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Ubicación GPS</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
                disabled={gettingLocation}
              >
                {gettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-1" />
                    Obtener ubicación
                  </>
                )}
              </Button>
            </div>
            {(latitude || longitude) && (
              <p className="text-sm text-muted-foreground">
                {latitude}, {longitude}
              </p>
            )}
            <input type="hidden" name="latitude" value={latitude} />
            <input type="hidden" name="longitude" value={longitude} />
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
