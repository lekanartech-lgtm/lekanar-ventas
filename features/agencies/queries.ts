import { pool } from '@/lib/db'
import type { Agency, AgencyRow } from './types'

function mapRowToAgency(row: AgencyRow): Agency {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    districtId: row.district_id,
    cityId: row.city_id,
    stateId: row.state_id,
    countryId: row.country_id,
    districtName: row.district_name,
    cityName: row.city_name,
    stateName: row.state_name,
    countryName: row.country_name,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

export async function getAgencies(): Promise<Agency[]> {
  const result = await pool.query<AgencyRow>(
    `SELECT
      a.*,
      d.name as district_name,
      c.name as city_name,
      s.name as state_name,
      co.name as country_name
    FROM agencies a
    LEFT JOIN districts d ON a.district_id = d.id
    LEFT JOIN cities c ON a.city_id = c.id
    LEFT JOIN states s ON a.state_id = s.id
    LEFT JOIN countries co ON a.country_id = co.id
    WHERE a.is_active = true
    ORDER BY a.name`,
  )
  return result.rows.map(mapRowToAgency)
}

export async function getAllAgencies(): Promise<Agency[]> {
  const result = await pool.query<AgencyRow>(
    `SELECT
      a.*,
      d.name as district_name,
      c.name as city_name,
      s.name as state_name,
      co.name as country_name
    FROM agencies a
    LEFT JOIN districts d ON a.district_id = d.id
    LEFT JOIN cities c ON a.city_id = c.id
    LEFT JOIN states s ON a.state_id = s.id
    LEFT JOIN countries co ON a.country_id = co.id
    ORDER BY a.name`,
  )
  return result.rows.map(mapRowToAgency)
}

export async function getAgencyById(id: string): Promise<Agency | null> {
  const result = await pool.query<AgencyRow>(
    `SELECT
      a.*,
      d.name as district_name,
      c.name as city_name,
      s.name as state_name,
      co.name as country_name
    FROM agencies a
    LEFT JOIN districts d ON a.district_id = d.id
    LEFT JOIN cities c ON a.city_id = c.id
    LEFT JOIN states s ON a.state_id = s.id
    LEFT JOIN countries co ON a.country_id = co.id
    WHERE a.id = $1`,
    [id],
  )
  return result.rows[0] ? mapRowToAgency(result.rows[0]) : null
}
