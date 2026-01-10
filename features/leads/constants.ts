import type { LeadStatus } from './types'

type StatusConfig = {
  label: string
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
}

export const LEAD_STATUS_CONFIG: Record<LeadStatus, StatusConfig> = {
  new: { label: 'Nuevo', variant: 'default' },
  converted: { label: 'Convertido', variant: 'secondary' },
}

export const TIME_PREFERENCES = [
  { value: 'morning', label: 'Mañana (8:00 - 12:00)' },
  { value: 'afternoon', label: 'Tarde (12:00 - 18:00)' },
  { value: 'evening', label: 'Noche (18:00 - 21:00)' },
  { value: 'any', label: 'Cualquier horario' },
]

export const OPERATORS = [
  { value: 'movistar', label: 'Movistar' },
  { value: 'claro', label: 'Claro' },
  { value: 'entel', label: 'Entel' },
  { value: 'bitel', label: 'Bitel' },
  { value: 'win', label: 'WIN' },
  { value: 'other', label: 'Otro' },
  { value: 'none', label: 'Sin servicio' },
]
