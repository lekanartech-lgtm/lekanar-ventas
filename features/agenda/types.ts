import type { Lead } from '@/features/leads'

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'any'

export type UrgencyLevel = 'critical' | 'high' | 'normal'

export type AgendaLead = Lead & {
  isOverdue: boolean
  daysOverdue: number
  urgencyLevel: UrgencyLevel
}

export type AgendaData = {
  overdue: AgendaLead[]
  slots: Record<TimeSlot, AgendaLead[]>
  totalCount: number
}

export type TimeSlotConfig = {
  label: string
  description: string
  hours: { start: number; end: number }
  icon: string
}
