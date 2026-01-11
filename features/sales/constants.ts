import type { RequestStatus, OrderStatus, AddressType } from './types'

type StatusConfig = {
  label: string
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
}

export const REQUEST_STATUS_CONFIG: Record<RequestStatus, StatusConfig> = {
  pending: { label: 'En proceso', variant: 'secondary' },
  validated: { label: 'Validado', variant: 'default' },
  cancelled: { label: 'Anulado', variant: 'destructive' },
  rejected: { label: 'Desaprobado', variant: 'destructive' },
  rescue: { label: 'Rescate', variant: 'outline' },
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: { label: 'En proceso', variant: 'secondary' },
  scheduled: { label: 'Programado', variant: 'default' },
  executed: { label: 'Ejecutado', variant: 'default' },
  rescue: { label: 'Rescate', variant: 'outline' },
  cancelled: { label: 'Anulado', variant: 'destructive' },
}

export const ADDRESS_TYPE_CONFIG: Record<AddressType, string> = {
  home: 'Hogar',
  multifamily: 'Multifamiliar',
  condo: 'Condominio / Edificio',
}

export const DEPARTMENTS = [
  'Amazonas',
  'Áncash',
  'Apurímac',
  'Arequipa',
  'Ayacucho',
  'Cajamarca',
  'Callao',
  'Cusco',
  'Huancavelica',
  'Huánuco',
  'Ica',
  'Junín',
  'La Libertad',
  'Lambayeque',
  'Lima',
  'Loreto',
  'Madre de Dios',
  'Moquegua',
  'Pasco',
  'Piura',
  'Puno',
  'San Martín',
  'Tacna',
  'Tumbes',
  'Ucayali',
]
