'use client'

import { useState, useEffect } from 'react'
import { TIME_SLOT_CONFIG } from '../constants'
import type { TimeSlot } from '../types'

type CurrentTimeSlotState = {
  currentSlot: TimeSlot | null
  timeRemaining: string
  isWorkHours: boolean
}

function getCurrentSlot(): TimeSlot | null {
  const hour = new Date().getHours()

  if (hour >= TIME_SLOT_CONFIG.morning.hours.start && hour < TIME_SLOT_CONFIG.morning.hours.end) {
    return 'morning'
  }
  if (hour >= TIME_SLOT_CONFIG.afternoon.hours.start && hour < TIME_SLOT_CONFIG.afternoon.hours.end) {
    return 'afternoon'
  }
  if (hour >= TIME_SLOT_CONFIG.evening.hours.start && hour < TIME_SLOT_CONFIG.evening.hours.end) {
    return 'evening'
  }

  return null
}

function getTimeRemaining(slot: TimeSlot | null): string {
  if (!slot) return ''

  const now = new Date()
  const currentHour = now.getHours()
  const currentMinutes = now.getMinutes()
  const endHour = TIME_SLOT_CONFIG[slot].hours.end

  const remainingMinutes = (endHour - currentHour) * 60 - currentMinutes

  if (remainingMinutes <= 0) return ''

  const hours = Math.floor(remainingMinutes / 60)
  const minutes = remainingMinutes % 60

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${minutes}min`
  }
}

export function useCurrentTimeSlot(): CurrentTimeSlotState {
  const [state, setState] = useState<CurrentTimeSlotState>(() => {
    const slot = getCurrentSlot()
    return {
      currentSlot: slot,
      timeRemaining: getTimeRemaining(slot),
      isWorkHours: slot !== null,
    }
  })

  useEffect(() => {
    function updateSlot() {
      const slot = getCurrentSlot()
      setState({
        currentSlot: slot,
        timeRemaining: getTimeRemaining(slot),
        isWorkHours: slot !== null,
      })
    }

    // Update immediately
    updateSlot()

    // Update every minute
    const interval = setInterval(updateSlot, 60000)

    return () => clearInterval(interval)
  }, [])

  return state
}
