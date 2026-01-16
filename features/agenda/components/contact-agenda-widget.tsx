'use client'

import Link from 'next/link'
import { Clock, ChevronRight, CalendarCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TimeSlotSection } from './time-slot-section'
import { OverdueAlert } from './overdue-alert'
import { useCurrentTimeSlot } from '../hooks/use-current-time-slot'
import { TIME_SLOT_ORDER } from '../constants'
import type { AgendaData, TimeSlot } from '../types'

type ContactAgendaWidgetProps = {
  agenda: AgendaData
  showAdvisor?: boolean
  editBasePath?: string
  agendaPath?: string
  newLeadPath?: string
}

export function ContactAgendaWidget({
  agenda,
  showAdvisor = false,
  editBasePath = '/dashboard/leads',
  agendaPath = '/dashboard/agenda',
  newLeadPath = '/dashboard/leads/new',
}: ContactAgendaWidgetProps) {
  const { currentSlot, timeRemaining } = useCurrentTimeSlot()

  const hasLeadsToday = agenda.totalCount > 0
  const todayLeadsCount = agenda.totalCount - agenda.overdue.length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Agenda de Hoy</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={agendaPath}>
              Ver todo
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {hasLeadsToday ? (
          <p className="text-sm text-muted-foreground">
            Tienes {todayLeadsCount} lead{todayLeadsCount !== 1 ? 's' : ''} para contactar hoy
            {agenda.overdue.length > 0 && (
              <span className="text-destructive font-medium">
                {' '}+ {agenda.overdue.length} vencido{agenda.overdue.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No tienes leads programados para hoy
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {agenda.overdue.length > 0 && (
          <OverdueAlert
            leads={agenda.overdue}
            showAdvisor={showAdvisor}
            editBasePath={editBasePath}
          />
        )}

        {hasLeadsToday ? (
          <>
            {TIME_SLOT_ORDER.map((slot) => (
              <TimeSlotSection
                key={slot}
                slot={slot}
                leads={agenda.slots[slot]}
                isCurrentSlot={currentSlot === slot}
                timeRemaining={currentSlot === slot ? timeRemaining : undefined}
                showAdvisor={showAdvisor}
                editBasePath={editBasePath}
              />
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarCheck className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              No hay leads programados para hoy
            </p>
            {newLeadPath && (
              <Button variant="link" size="sm" asChild className="mt-2">
                <Link href={newLeadPath}>Agregar nuevo lead</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
