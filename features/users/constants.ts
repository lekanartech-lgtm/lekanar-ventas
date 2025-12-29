import type { Role } from '@/features/auth'

type RoleConfig = {
  label: string
  description: string
  variant: 'default' | 'secondary' | 'outline'
}

export const ROLE_CONFIG: Record<Role, RoleConfig> = {
  admin: {
    label: 'Administrador',
    description: 'Acceso total al sistema',
    variant: 'default',
  },
  supervisor: {
    label: 'Supervisor',
    description: 'Supervisa asesores y ventas',
    variant: 'secondary',
  },
  asesor: {
    label: 'Asesor',
    description: 'Gestiona leads y ventas',
    variant: 'outline',
  },
  backoffice: {
    label: 'Backoffice',
    description: 'Procesa ventas en Winforce',
    variant: 'outline',
  },
}
