import { pool } from '@/lib/db'
import type { Lead } from '@/features/leads'
import type { AgendaLead, AgendaData, TimeSlot } from './types'
import { getUrgencyLevel, TIME_SLOT_ORDER } from './constants'

type AgendaLeadRow = {
  id: string
  full_name: string
  dni: string
  phone: string
  contact_date: Date
  contact_time_preference: string | null
  referral_source_id: string | null
  referral_source_name: string | null
  current_operator: string | null
  notes: string | null
  status: 'new' | 'converted'
  user_id: string
  operator_id: string | null
  operator_name: string | null
  address: string | null
  district_id: string | null
  district_name: string | null
  city_name: string | null
  state_name: string | null
  latitude: string | null
  longitude: string | null
  reference: string | null
  created_at: Date
  updated_at: Date
  is_overdue: boolean
  days_overdue: number
}

function mapRowToAgendaLead(row: AgendaLeadRow): AgendaLead {
  const daysOverdue = row.is_overdue ? row.days_overdue : 0

  return {
    id: row.id,
    fullName: row.full_name,
    dni: row.dni,
    phone: row.phone,
    contactDate: row.contact_date,
    contactTimePreference: row.contact_time_preference,
    referralSourceId: row.referral_source_id,
    referralSourceName: row.referral_source_name ?? undefined,
    currentOperator: row.current_operator,
    notes: row.notes,
    status: row.status,
    userId: row.user_id,
    operatorId: row.operator_id,
    operatorName: row.operator_name ?? undefined,
    address: row.address,
    districtId: row.district_id,
    districtName: row.district_name ?? undefined,
    cityName: row.city_name ?? undefined,
    stateName: row.state_name ?? undefined,
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null,
    reference: row.reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isOverdue: row.is_overdue,
    daysOverdue,
    urgencyLevel: getUrgencyLevel(daysOverdue),
  }
}

export async function getAgendaByUserId(userId: string): Promise<AgendaData> {
  const result = await pool.query<AgendaLeadRow>(
    `SELECT
      l.*,
      rs.name as referral_source_name,
      o.name as operator_name,
      d.name as district_name,
      c.name as city_name,
      s.name as state_name,
      (l.contact_date < CURRENT_DATE) as is_overdue,
      GREATEST(0, CURRENT_DATE - l.contact_date)::int as days_overdue
    FROM leads l
    LEFT JOIN referral_sources rs ON l.referral_source_id = rs.id
    LEFT JOIN operators o ON l.operator_id = o.id
    LEFT JOIN districts d ON l.district_id = d.id
    LEFT JOIN cities c ON d.city_id = c.id
    LEFT JOIN states s ON c.state_id = s.id
    WHERE l.user_id = $1
      AND l.status = 'new'
      AND l.contact_date <= CURRENT_DATE
    ORDER BY
      is_overdue DESC,
      days_overdue DESC,
      l.contact_date ASC`,
    [userId]
  )

  const leads = result.rows.map(mapRowToAgendaLead)

  // Separate overdue and group by time slot
  const overdue: AgendaLead[] = []
  const slots: Record<TimeSlot, AgendaLead[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    any: [],
  }

  for (const lead of leads) {
    if (lead.isOverdue) {
      overdue.push(lead)
    } else {
      const slot = (lead.contactTimePreference as TimeSlot) || 'any'
      if (slots[slot]) {
        slots[slot].push(lead)
      } else {
        slots.any.push(lead)
      }
    }
  }

  return {
    overdue,
    slots,
    totalCount: leads.length,
  }
}

export async function getAgendaByDate(
  userId: string,
  date: Date
): Promise<AgendaData> {
  const dateStr = date.toISOString().split('T')[0]

  const result = await pool.query<AgendaLeadRow>(
    `SELECT
      l.*,
      rs.name as referral_source_name,
      o.name as operator_name,
      d.name as district_name,
      c.name as city_name,
      s.name as state_name,
      (l.contact_date < $2::date) as is_overdue,
      GREATEST(0, $2::date - l.contact_date)::int as days_overdue
    FROM leads l
    LEFT JOIN referral_sources rs ON l.referral_source_id = rs.id
    LEFT JOIN operators o ON l.operator_id = o.id
    LEFT JOIN districts d ON l.district_id = d.id
    LEFT JOIN cities c ON d.city_id = c.id
    LEFT JOIN states s ON c.state_id = s.id
    WHERE l.user_id = $1
      AND l.status = 'new'
      AND l.contact_date <= $2::date
    ORDER BY
      is_overdue DESC,
      days_overdue DESC,
      l.contact_date ASC`,
    [userId, dateStr]
  )

  const leads = result.rows.map(mapRowToAgendaLead)

  const overdue: AgendaLead[] = []
  const slots: Record<TimeSlot, AgendaLead[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    any: [],
  }

  for (const lead of leads) {
    if (lead.isOverdue) {
      overdue.push(lead)
    } else {
      const slot = (lead.contactTimePreference as TimeSlot) || 'any'
      if (slots[slot]) {
        slots[slot].push(lead)
      } else {
        slots.any.push(lead)
      }
    }
  }

  return {
    overdue,
    slots,
    totalCount: leads.length,
  }
}
