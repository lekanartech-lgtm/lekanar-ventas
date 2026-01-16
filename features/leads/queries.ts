import { pool } from '@/lib/db'
import type { Lead, ReferralSource, State, City, District } from './types'

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
  operator_id: string | null
  operator_name: string | null
  // Address fields
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
    operatorId: row.operator_id,
    operatorName: row.operator_name ?? undefined,
    // Address fields
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
  }
}

export async function getLeadsByUserId(userId: string): Promise<Lead[]> {
  const result = await pool.query<LeadRow>(
    `SELECT
      l.*,
      rs.name as referral_source_name,
      o.name as operator_name,
      d.name as district_name,
      c.name as city_name,
      s.name as state_name
    FROM leads l
    LEFT JOIN referral_sources rs ON l.referral_source_id = rs.id
    LEFT JOIN operators o ON l.operator_id = o.id
    LEFT JOIN districts d ON l.district_id = d.id
    LEFT JOIN cities c ON d.city_id = c.id
    LEFT JOIN states s ON c.state_id = s.id
    WHERE l.user_id = $1
    ORDER BY l.created_at DESC`,
    [userId],
  )
  return result.rows.map(mapRowToLead)
}

export async function getLeadById(
  id: string,
  userId: string,
): Promise<Lead | null> {
  const result = await pool.query<LeadRow>(
    `SELECT
      l.*,
      rs.name as referral_source_name,
      o.name as operator_name,
      d.name as district_name,
      c.name as city_name,
      s.name as state_name
    FROM leads l
    LEFT JOIN referral_sources rs ON l.referral_source_id = rs.id
    LEFT JOIN operators o ON l.operator_id = o.id
    LEFT JOIN districts d ON l.district_id = d.id
    LEFT JOIN cities c ON d.city_id = c.id
    LEFT JOIN states s ON c.state_id = s.id
    WHERE l.id = $1 AND l.user_id = $2`,
    [id, userId],
  )
  return result.rows[0] ? mapRowToLead(result.rows[0]) : null
}

export async function getLeadByIdForAdmin(
  id: string,
): Promise<(Lead & { userName?: string }) | null> {
  const result = await pool.query<LeadRow & { user_name: string }>(
    `SELECT
      l.*,
      rs.name as referral_source_name,
      o.name as operator_name,
      u.name as user_name,
      d.name as district_name,
      c.name as city_name,
      s.name as state_name
    FROM leads l
    LEFT JOIN referral_sources rs ON l.referral_source_id = rs.id
    LEFT JOIN operators o ON l.operator_id = o.id
    LEFT JOIN "user" u ON l.user_id = u.id
    LEFT JOIN districts d ON l.district_id = d.id
    LEFT JOIN cities c ON d.city_id = c.id
    LEFT JOIN states s ON c.state_id = s.id
    WHERE l.id = $1`,
    [id],
  )
  if (!result.rows[0]) return null
  return {
    ...mapRowToLead(result.rows[0]),
    userName: result.rows[0].user_name,
  }
}

export async function getLeadsBySupervisor(
  supervisorId: string,
): Promise<Lead[]> {
  const result = await pool.query<LeadRow>(
    `SELECT
      l.*,
      rs.name as referral_source_name,
      o.name as operator_name,
      d.name as district_name,
      c.name as city_name,
      s.name as state_name
    FROM leads l
    LEFT JOIN referral_sources rs ON l.referral_source_id = rs.id
    LEFT JOIN operators o ON l.operator_id = o.id
    LEFT JOIN districts d ON l.district_id = d.id
    LEFT JOIN cities c ON d.city_id = c.id
    LEFT JOIN states s ON c.state_id = s.id
    JOIN supervisor_advisors sa ON l.user_id = sa.advisor_id
    WHERE sa.supervisor_id = $1
    ORDER BY l.created_at DESC`,
    [supervisorId],
  )
  return result.rows.map(mapRowToLead)
}

export async function getAllLeads(): Promise<Lead[]> {
  const result = await pool.query<LeadRow & { user_name: string }>(
    `SELECT
      l.*,
      rs.name as referral_source_name,
      o.name as operator_name,
      u.name as user_name,
      d.name as district_name,
      c.name as city_name,
      s.name as state_name
    FROM leads l
    LEFT JOIN referral_sources rs ON l.referral_source_id = rs.id
    LEFT JOIN operators o ON l.operator_id = o.id
    LEFT JOIN "user" u ON l.user_id = u.id
    LEFT JOIN districts d ON l.district_id = d.id
    LEFT JOIN cities c ON d.city_id = c.id
    LEFT JOIN states s ON c.state_id = s.id
    ORDER BY l.created_at DESC`,
  )
  return result.rows.map((row) => ({
    ...mapRowToLead(row),
    userName: row.user_name,
  }))
}

export async function getReferralSources(): Promise<ReferralSource[]> {
  const result = await pool.query<{
    id: string
    name: string
    is_active: boolean
  }>(
    `SELECT id, name, is_active FROM referral_sources WHERE is_active = true ORDER BY name`,
  )
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    isActive: row.is_active,
  }))
}

// Location queries
export async function getStates(countryId: string = 'PE'): Promise<State[]> {
  const result = await pool.query<{
    id: string
    country_id: string
    name: string
    is_active: boolean
  }>(
    `SELECT id, country_id, name, is_active
     FROM states
     WHERE country_id = $1 AND is_active = true
     ORDER BY name`,
    [countryId],
  )
  return result.rows.map((row) => ({
    id: row.id,
    countryId: row.country_id,
    name: row.name,
    isActive: row.is_active,
  }))
}

export async function getCitiesByState(stateId: string): Promise<City[]> {
  const result = await pool.query<{
    id: string
    state_id: string
    name: string
    is_active: boolean
  }>(
    `SELECT id, state_id, name, is_active
     FROM cities
     WHERE state_id = $1 AND is_active = true
     ORDER BY name`,
    [stateId],
  )
  return result.rows.map((row) => ({
    id: row.id,
    stateId: row.state_id,
    name: row.name,
    isActive: row.is_active,
  }))
}

export async function getDistrictsByCity(cityId: string): Promise<District[]> {
  const result = await pool.query<{
    id: string
    city_id: string
    state_id: string | null
    name: string
    is_active: boolean
  }>(
    `SELECT id, city_id, state_id, name, is_active
     FROM districts
     WHERE city_id = $1 AND is_active = true
     ORDER BY name`,
    [cityId],
  )
  return result.rows.map((row) => ({
    id: row.id,
    cityId: row.city_id,
    stateId: row.state_id,
    name: row.name,
    isActive: row.is_active,
  }))
}
