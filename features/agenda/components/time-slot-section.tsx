'use client'

import { useState } from 'react'
import { ChevronDown, Sunrise, Sun, Moon, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AgendaLeadCard } from './agenda-lead-card'
import { TIME_SLOT_CONFIG } from '../constants'
import type { AgendaLead, TimeSlot } from '../types'

const SLOT_ICONS = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Moon,
  any: Clock,
}

type TimeSlotSectionProps = {
  slot: TimeSlot
  leads: AgendaLead[]
  isCurrentSlot: boolean
  timeRemaining?: string
  defaultExpanded?: boolean
  showAdvisor?: boolean
  editBasePath?: string
}

export function TimeSlotSection({
  slot,
  leads,
  isCurrentSlot,
  timeRemaining,
  defaultExpanded = false,
  showAdvisor = false,
  editBasePath,
}: TimeSlotSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || isCurrentSlot)
  const config = TIME_SLOT_CONFIG[slot]
  const Icon = SLOT_ICONS[slot]
  const isEmpty = leads.length === 0

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden transition-all',
        isCurrentSlot && 'ring-2 ring-primary ring-offset-2',
        isEmpty && 'opacity-60'
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between p-3 text-left transition-colors',
          isCurrentSlot ? 'bg-primary/10' : 'bg-muted/30 hover:bg-muted/50'
        )}
        disabled={isEmpty}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn('h-5 w-5', isCurrentSlot ? 'text-primary' : 'text-muted-foreground')} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{config.label}</span>
              <span className="text-sm text-muted-foreground">({config.description})</span>
            </div>
            {isCurrentSlot && timeRemaining && (
              <p className="text-xs text-primary flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Termina en {timeRemaining}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCurrentSlot && !isEmpty && (
            <Badge className="bg-primary">AHORA</Badge>
          )}
          <Badge variant="secondary">{leads.length}</Badge>
          {!isEmpty && (
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform text-muted-foreground',
                isExpanded && 'rotate-180'
              )}
            />
          )}
        </div>
      </button>

      {isExpanded && !isEmpty && (
        <div className="p-3 space-y-3 bg-background animate-in fade-in slide-in-from-top-2 duration-200">
          {leads.map((lead) => (
            <AgendaLeadCard
              key={lead.id}
              lead={lead}
              isCurrentSlot={isCurrentSlot}
              showAdvisor={showAdvisor}
              editBasePath={editBasePath}
            />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Sin leads para este horario
        </div>
      )}
    </div>
  )
}
