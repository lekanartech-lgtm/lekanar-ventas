import type { TimeSlot, TimeSlotConfig } from './types'

export const TIME_SLOT_CONFIG: Record<TimeSlot, TimeSlotConfig> = {
  morning: {
    label: 'Mañana',
    description: '8:00 - 12:00',
    hours: { start: 8, end: 12 },
    icon: 'Sunrise',
  },
  afternoon: {
    label: 'Tarde',
    description: '12:00 - 18:00',
    hours: { start: 12, end: 18 },
    icon: 'Sun',
  },
  evening: {
    label: 'Noche',
    description: '18:00 - 21:00',
    hours: { start: 18, end: 21 },
    icon: 'Moon',
  },
  any: {
    label: 'Cualquier horario',
    description: 'Flexible',
    hours: { start: 8, end: 21 },
    icon: 'Clock',
  },
}

export const TIME_SLOT_ORDER: TimeSlot[] = ['morning', 'afternoon', 'evening', 'any']

export const URGENCY_CONFIG = {
  critical: {
    minDaysOverdue: 3,
    color: 'destructive' as const,
    label: 'Urgente',
  },
  high: {
    minDaysOverdue: 1,
    color: 'warning' as const,
    label: 'Vencido',
  },
  normal: {
    minDaysOverdue: 0,
    color: 'default' as const,
    label: null,
  },
}

export function getUrgencyLevel(daysOverdue: number): 'critical' | 'high' | 'normal' {
  if (daysOverdue >= URGENCY_CONFIG.critical.minDaysOverdue) return 'critical'
  if (daysOverdue >= URGENCY_CONFIG.high.minDaysOverdue) return 'high'
  return 'normal'
}
