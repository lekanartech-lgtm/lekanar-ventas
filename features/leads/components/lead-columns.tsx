'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LeadStatusBadge } from './lead-status-badge'
import { OPERATORS } from '../constants'
import type { Lead } from '../types'

// Helper function
function getOperatorLabel(value: string | null): string {
  if (!value) return '-'
  const op = OPERATORS.find((o) => o.value === value)
  return op?.label || value
}

// Base lead type that can be extended
export type BaseLead = Lead & {
  userName?: string
}

// Column: Cliente (fullName + DNI)
export function createClientColumn<T extends BaseLead>(): ColumnDef<T> {
  return {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Cliente
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const lead = row.original
      return (
        <Link href={`/dashboard/leads/${lead.id}/edit`}>
          <div>
            <div className="font-medium">{lead.fullName}</div>
            {lead.dni && (
              <p className="text-sm text-muted-foreground">DNI: {lead.dni}</p>
            )}
          </div>
        </Link>
      )
    },
  }
}

// Column: Asesor (userName) - for admin view
export function createAdvisorColumn<T extends BaseLead>(): ColumnDef<T> {
  return {
    accessorKey: 'userName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Asesor
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const userName = row.getValue('userName') as string | undefined
      return userName || <span className="text-muted-foreground">-</span>
    },
  }
}

// Column: Teléfono
export function createPhoneColumn<T extends BaseLead>(): ColumnDef<T> {
  return {
    accessorKey: 'phone',
    header: 'Teléfono',
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string
      return (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-1 text-primary hover:underline"
        >
          <Phone className="h-3 w-3" />
          {phone}
        </a>
      )
    },
  }
}

// Column: Operador (target operator)
export function createOperatorColumn<T extends BaseLead>(): ColumnDef<T> {
  return {
    accessorKey: 'operatorName',
    header: 'Operador',
    cell: ({ row }) => {
      const operatorName = row.getValue('operatorName') as string | undefined
      return operatorName || <span className="text-muted-foreground">-</span>
    },
  }
}

// Column: ISP Actual (current operator)
export function createCurrentOperatorColumn<
  T extends BaseLead,
>(): ColumnDef<T> {
  return {
    accessorKey: 'currentOperator',
    header: 'ISP Actual',
    cell: ({ row }) => getOperatorLabel(row.getValue('currentOperator')),
  }
}

// Column: Ubicación (district + city)
export function createLocationColumn<T extends BaseLead>(): ColumnDef<T> {
  return {
    id: 'location',
    header: 'Ubicación',
    cell: ({ row }) => {
      const lead = row.original
      const parts = [lead.districtName, lead.cityName].filter(Boolean)

      if (parts.length === 0) {
        return <span className="text-muted-foreground">-</span>
      }

      return (
        <div>
          <div className="font-medium">{parts[0]}</div>
          {parts[1] && (
            <div className="text-sm text-muted-foreground">{parts[1]}</div>
          )}
        </div>
      )
    },
  }
}

// Column: Estado
export function createStatusColumn<T extends BaseLead>(): ColumnDef<T> {
  return {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => <LeadStatusBadge status={row.getValue('status')} />,
  }
}

// Column: Fecha
export function createDateColumn<T extends BaseLead>(options?: {
  showYear?: boolean
}): ColumnDef<T> {
  const { showYear = false } = options || {}

  return {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Fecha
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      const formatOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        ...(showYear && { year: 'numeric' }),
      }
      return (
        <span className="text-muted-foreground">
          {new Date(date).toLocaleDateString('es-PE', formatOptions)}
        </span>
      )
    },
  }
}

// Column: Actions - generic wrapper
export function createActionsColumn<T extends BaseLead>(
  renderActions: (lead: T) => React.ReactNode,
): ColumnDef<T> {
  return {
    id: 'actions',
    cell: ({ row }) => renderActions(row.original),
  }
}
