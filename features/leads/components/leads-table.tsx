'use client'

import Link from 'next/link'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ShoppingCart,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BaseLeadsTable } from './base-leads-table'
import { LeadStatusBadge } from './lead-status-badge'
import {
  createClientColumn,
  createPhoneColumn,
  createOperatorColumn,
  createCurrentOperatorColumn,
  createStatusColumn,
  createDateColumn,
  createActionsColumn,
} from './lead-columns'
import type { Lead } from '../types'

function LeadActions({ lead }: { lead: Lead }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {lead.status === 'new' && (
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/sales/new?leadId=${lead.id}`}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Convertir a venta
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/leads/${lead.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const columns = [
  createClientColumn<Lead>(),
  createPhoneColumn<Lead>(),
  createOperatorColumn<Lead>(),
  createCurrentOperatorColumn<Lead>(),
  createStatusColumn<Lead>(),
  createDateColumn<Lead>(),
  createActionsColumn<Lead>((lead) => <LeadActions lead={lead} />),
]

export function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <BaseLeadsTable
      leads={leads}
      columns={columns}
      searchPlaceholder="Buscar por nombre o DNI..."
      pageSize={10}
    />
  )
}

// Mobile-friendly card list for small screens
export function LeadsCardList({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay leads registrados
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <Card key={lead.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-medium">{lead.fullName}</p>
                <p className="text-sm text-muted-foreground">DNI: {lead.dni}</p>
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-1 text-sm text-primary"
                >
                  <Phone className="h-3 w-3" />
                  {lead.phone}
                </a>
              </div>
              <div className="flex flex-col items-end gap-2">
                {lead.operatorName && (
                  <span className="text-xs font-medium text-primary">
                    {lead.operatorName}
                  </span>
                )}
                <LeadStatusBadge status={lead.status} />
                <span className="text-xs text-muted-foreground">
                  {new Date(lead.createdAt).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {lead.status === 'new' && (
                <Button size="sm" className="flex-1" asChild>
                  <Link href={`/dashboard/sales/new?leadId=${lead.id}`}>
                    <ShoppingCart className="mr-2 h-3 w-3" />
                    Vender
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className={lead.status === 'new' ? '' : 'flex-1'}
                asChild
              >
                <Link href={`/dashboard/leads/${lead.id}/edit`}>
                  <Pencil className="mr-2 h-3 w-3" />
                  Editar
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${lead.phone}`}>
                  <Phone className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
