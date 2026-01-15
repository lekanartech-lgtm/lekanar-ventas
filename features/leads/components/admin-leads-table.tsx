'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BaseLeadsTable } from './base-leads-table'
import {
  createClientColumn,
  createAdvisorColumn,
  createPhoneColumn,
  createOperatorColumn,
  createLocationColumn,
  createStatusColumn,
  createDateColumn,
  createActionsColumn,
  type BaseLead,
} from './lead-columns'

type AdminLead = BaseLead & { userName?: string }

function AdminLeadActions({ lead }: { lead: AdminLead }) {
  return (
    <Button variant="ghost" size="icon" asChild>
      <Link href={`/admin/leads/${lead.id}/edit`}>
        <Pencil className="h-4 w-4" />
      </Link>
    </Button>
  )
}

const columns = [
  createClientColumn<AdminLead>(),
  createAdvisorColumn<AdminLead>(),
  createPhoneColumn<AdminLead>(),
  createOperatorColumn<AdminLead>(),
  createLocationColumn<AdminLead>(),
  createStatusColumn<AdminLead>(),
  createDateColumn<AdminLead>({ showYear: true }),
  createActionsColumn<AdminLead>((lead) => <AdminLeadActions lead={lead} />),
]

export function AdminLeadsTable({ leads }: { leads: AdminLead[] }) {
  return (
    <BaseLeadsTable
      leads={leads}
      columns={columns}
      searchPlaceholder="Buscar por nombre, DNI o asesor..."
      pageSize={20}
    />
  )
}
