'use client'

import { useState } from 'react'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AgendaLeadCard } from './agenda-lead-card'
import type { AgendaLead } from '../types'

type OverdueAlertProps = {
  leads: AgendaLead[]
}

export function OverdueAlert({ leads }: OverdueAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (leads.length === 0) return null

  const criticalCount = leads.filter((l) => l.urgencyLevel === 'critical').length

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          <span>Leads con contacto vencido</span>
        </AlertTitle>
        <AlertDescription className="flex items-center justify-between mt-1">
          <span>
            Tienes {leads.length} lead{leads.length > 1 ? 's' : ''} que{' '}
            {leads.length > 1 ? 'debieron' : 'debió'} contactarse antes de hoy
            {criticalCount > 0 && (
              <span className="font-semibold"> ({criticalCount} urgente{criticalCount > 1 ? 's' : ''})</span>
            )}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-destructive hover:text-destructive"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ocultar' : 'Ver todos'}
            <ChevronDown
              className={cn(
                'ml-1 h-4 w-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </Button>
        </AlertDescription>
      </Alert>

      {isExpanded && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {leads.map((lead) => (
            <AgendaLeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  )
}
