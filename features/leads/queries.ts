import { pool } from '@/lib/db'
import type { Lead, ReferralSource } from './types'

type LeadRow = {
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
  created_at: Date
  updated_at: Date
}

function mapRowToLead(row: LeadRow): Lead {
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getLeadsByUserId(userId: string): Promise<Lead[]> {
  const result = await pool.query<LeadRow>(
    `SELECT
      l.*,
      rs.name as referral_source_name
    FROM leads l
    LEFT JOIN referral_sources rs ON l.referral_source_id = rs.id
    WHERE l.user_id = $1
    ORDER BY l.created_at DESC`,
    [userId]
  )
  return result.rows.map(mapRowToLead)
}

export async function getLeadById(id: string, userId: string): Promise<Lead | null> {
  const result = await pool.query<LeadRow>(
    `SELECT
      l.*,
      rs.name as referral_source_name
    FROM leads l
    LEFT JOIN referral_sources rs ON l.referral_source_id = rs.id
    WHERE l.id = $1 AND l.user_id = $2`,
    [id, userId]
  )
  return result.rows[0] ? mapRowToLead(result.rows[0]) : null
}

export async function getReferralSources(): Promise<ReferralSource[]> {
  const result = await pool.query<{ id: string; name: string; is_active: boolean }>(
    `SELECT id, name, is_active FROM referral_sources WHERE is_active = true ORDER BY name`
  )
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    isActive: row.is_active,
  }))
}
