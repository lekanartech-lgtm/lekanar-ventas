'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BaseLeadsTable } from './base-leads-table'
import {
  createClientColumn,
  createAdvisorColumn,
  createPhoneColumn,
  createOperatorColumn,
  createCurrentOperatorColumn,
  createStatusColumn,
  createDateColumn,
  createActionsColumn,
  type BaseLead,
} from './lead-columns'

type BackofficeLead = BaseLead & { userName?: string }

function BackofficeLeadActions({ lead }: { lead: BackofficeLead }) {
  return (
    <Button variant="ghost" size="icon" asChild>
      <Link href={`/dashboard/backoffice/leads/${lead.id}`}>
        <Eye className="h-4 w-4" />
      </Link>
    </Button>
  )
}

const columns = [
  createClientColumn<BackofficeLead>(),
  createAdvisorColumn<BackofficeLead>(),
  createPhoneColumn<BackofficeLead>(),
  createOperatorColumn<BackofficeLead>(),
  createCurrentOperatorColumn<BackofficeLead>(),
  createStatusColumn<BackofficeLead>(),
  createDateColumn<BackofficeLead>(),
  createActionsColumn<BackofficeLead>((lead) => (
    <BackofficeLeadActions lead={lead} />
  )),
]

export function BackofficeLeadsTable({ leads }: { leads: BackofficeLead[] }) {
  return (
    <BaseLeadsTable
      leads={leads}
      columns={columns}
      searchPlaceholder="Buscar por nombre, DNI o asesor..."
      pageSize={20}
    />
  )
}
