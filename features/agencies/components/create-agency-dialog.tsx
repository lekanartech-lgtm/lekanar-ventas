'use client'

import { useState, useTransition } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createAgency } from '../actions'
import {
  fetchCitiesByState,
  fetchDistrictsByCity,
} from '@/features/leads/actions'
import type { State, City, District } from '../types'

type CreateAgencyDialogProps = {
  states: State[]
}

export function CreateAgencyDialog({ states }: CreateAgencyDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [selectedStateId, setSelectedStateId] = useState('')
  const [selectedCityId, setSelectedCityId] = useState('')
  const [selectedDistrictId, setSelectedDistrictId] = useState('')
  const [cities, setCities] = useState<City[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)

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

  function resetForm() {
    setSelectedStateId('')
    setSelectedCityId('')
    setSelectedDistrictId('')
    setCities([])
    setDistricts([])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createAgency({
        name: formData.get('name') as string,
        address: formData.get('address') as string,
        countryId: 'PE',
        stateId: selectedStateId,
        cityId: selectedCityId,
        districtId: selectedDistrictId,
      })

      if (result.success) {
        setOpen(false)
        resetForm()
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva agencia
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nueva agencia</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Nombre de la agencia"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stateId">Departamento</Label>
            <Select value={selectedStateId} onValueChange={handleStateChange}>
              <SelectTrigger id="stateId">
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
            <Label htmlFor="cityId">Provincia</Label>
            <Select
              value={selectedCityId}
              onValueChange={handleCityChange}
              disabled={!selectedStateId || loadingCities}
            >
              <SelectTrigger id="cityId">
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
            <Label htmlFor="districtId">Distrito</Label>
            <Select
              value={selectedDistrictId}
              onValueChange={setSelectedDistrictId}
              disabled={!selectedCityId || loadingDistricts}
            >
              <SelectTrigger id="districtId">
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
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              name="address"
              placeholder="Dirección de la agencia"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear agencia
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
