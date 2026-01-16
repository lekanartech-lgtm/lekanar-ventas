'use client'

import { useState, useTransition, useEffect } from 'react'
import { MoreHorizontal, Pencil, Power, PowerOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toggleAgencyStatus, updateAgency } from '../actions'
import {
  fetchCitiesByState,
  fetchDistrictsByCity,
} from '@/features/leads/actions'
import type { Agency, State, City, District } from '../types'

type AgencyActionsProps = {
  agency: Agency
  states: State[]
}

export function AgencyActions({ agency, states }: AgencyActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)

  const [selectedStateId, setSelectedStateId] = useState(agency.stateId || '')
  const [selectedCityId, setSelectedCityId] = useState(agency.cityId || '')
  const [selectedDistrictId, setSelectedDistrictId] = useState(
    agency.districtId || '',
  )
  const [cities, setCities] = useState<City[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!editOpen || initialized) return

    let cancelled = false

    async function loadInitialData() {
      if (agency.stateId) {
        setLoadingCities(true)
        try {
          const citiesData = await fetchCitiesByState(agency.stateId)
          if (!cancelled) setCities(citiesData)

          if (agency.cityId) {
            setLoadingDistricts(true)
            const districtsData = await fetchDistrictsByCity(agency.cityId)
            if (!cancelled) setDistricts(districtsData)
          }
        } catch (error) {
          console.error(error)
        } finally {
          if (!cancelled) {
            setLoadingCities(false)
            setLoadingDistricts(false)
            setInitialized(true)
          }
        }
      } else {
        setInitialized(true)
      }
    }

    loadInitialData()

    return () => {
      cancelled = true
    }
  }, [editOpen, agency.id, agency.stateId, agency.cityId, initialized])

  const handleStateChange = async (stateId: string) => {
    setSelectedStateId(stateId)
    if (stateId !== agency.stateId) {
      setSelectedCityId('')
      setSelectedDistrictId('')
    }
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
    if (cityId !== agency.cityId) {
      setSelectedDistrictId('')
    }

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

  function handleToggleStatus() {
    startTransition(async () => {
      await toggleAgencyStatus(agency.id, !agency.isActive)
    })
  }

  function resetForm() {
    setSelectedStateId(agency.stateId || '')
    setSelectedCityId(agency.cityId || '')
    setSelectedDistrictId(agency.districtId || '')
    setInitialized(false)
    setCities([])
    setDistricts([])
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateAgency(agency.id, {
        name: formData.get('name') as string,
        address: formData.get('address') as string,
        countryId: 'PE',
        stateId: selectedStateId,
        cityId: selectedCityId,
        districtId: selectedDistrictId,
      })

      if (result.success) {
        setEditOpen(false)
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggleStatus}>
            {agency.isActive ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Desactivar
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Activar
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={editOpen}
        onOpenChange={(isOpen) => {
          setEditOpen(isOpen)
          if (!isOpen) resetForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar agencia</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={agency.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-stateId">Departamento</Label>
              <Select value={selectedStateId} onValueChange={handleStateChange}>
                <SelectTrigger id="edit-stateId">
                  <SelectValue placeholder="Seleccionar departamento" />
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
              <Label htmlFor="edit-cityId">Provincia</Label>
              <Select
                value={selectedCityId}
                onValueChange={handleCityChange}
                disabled={!selectedStateId || loadingCities}
              >
                <SelectTrigger id="edit-cityId">
                  <SelectValue
                    placeholder={
                      loadingCities ? 'Cargando...' : 'Seleccionar provincia'
                    }
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
              <Label htmlFor="edit-districtId">Distrito</Label>
              <Select
                value={selectedDistrictId}
                onValueChange={setSelectedDistrictId}
                disabled={!selectedCityId || loadingDistricts}
              >
                <SelectTrigger id="edit-districtId">
                  <SelectValue
                    placeholder={
                      loadingDistricts ? 'Cargando...' : 'Seleccionar distrito'
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

            <div className="space-y-2">
              <Label htmlFor="edit-address">Dirección</Label>
              <Input
                id="edit-address"
                name="address"
                defaultValue={agency.address || ''}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
