'use client'

import { CalendarCheck } from 'lucide-react'
import { TimeSlotSection } from './time-slot-section'
import { OverdueAlert } from './overdue-alert'
import { useCurrentTimeSlot } from '../hooks/use-current-time-slot'
import { TIME_SLOT_ORDER } from '../constants'
import type { AgendaData } from '../types'

type ContactAgendaFullProps = {
  agenda: AgendaData
  showAdvisor?: boolean
  editBasePath?: string
}

export function ContactAgendaFull({
  agenda,
  showAdvisor = false,
  editBasePath = '/dashboard/leads',
}: ContactAgendaFullProps) {
  const { currentSlot, timeRemaining } = useCurrentTimeSlot()

  const hasLeadsToday = agenda.totalCount > 0
  const todayLeadsCount = agenda.totalCount - agenda.overdue.length

  return (
    <div className="space-y-4">
      {hasLeadsToday ? (
        <p className="text-muted-foreground">
          Tienes {todayLeadsCount} lead{todayLeadsCount !== 1 ? 's' : ''} para contactar hoy
          {agenda.overdue.length > 0 && (
            <span className="text-destructive font-medium">
              {' '}+ {agenda.overdue.length} vencido{agenda.overdue.length !== 1 ? 's' : ''}
            </span>
          )}
        </p>
      ) : (
        <p className="text-muted-foreground">
          No tienes leads programados para hoy
        </p>
      )}

      {agenda.overdue.length > 0 && (
        <OverdueAlert
          leads={agenda.overdue}
          showAdvisor={showAdvisor}
          editBasePath={editBasePath}
        />
      )}

      {hasLeadsToday ? (
        <div className="space-y-4">
          {TIME_SLOT_ORDER.map((slot) => (
            <TimeSlotSection
              key={slot}
              slot={slot}
              leads={agenda.slots[slot]}
              isCurrentSlot={currentSlot === slot}
              timeRemaining={currentSlot === slot ? timeRemaining : undefined}
              defaultExpanded={true}
              showAdvisor={showAdvisor}
              editBasePath={editBasePath}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarCheck className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Todo al día</h3>
          <p className="text-muted-foreground">
            No hay leads programados para contactar hoy
          </p>
        </div>
      )}
    </div>
  )
}
