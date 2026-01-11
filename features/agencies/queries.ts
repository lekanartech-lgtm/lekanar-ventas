import { pool } from '@/lib/db'
import type { Agency, AgencyRow } from './types'

function mapRowToAgency(row: AgencyRow): Agency {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    address: row.address,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getAgencies(): Promise<Agency[]> {
  const result = await pool.query<AgencyRow>(
    `SELECT * FROM agencies WHERE is_active = true ORDER BY name`
  )
  return result.rows.map(mapRowToAgency)
}

export async function getAgencyById(id: string): Promise<Agency | null> {
  const result = await pool.query<AgencyRow>(
    `SELECT * FROM agencies WHERE id = $1`,
    [id]
  )
  return result.rows[0] ? mapRowToAgency(result.rows[0]) : null
}
