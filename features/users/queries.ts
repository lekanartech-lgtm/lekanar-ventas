import { pool } from '@/lib/db'
import type { UserWithAgency } from './types'

type UserRow = {
  id: string
  name: string
  email: string
  role: string | null
  banned: boolean | null
  agency_id: string | null
  agency_name: string | null
  agency_city: string | null
  created_at: Date
}

export async function getUsersWithAgency(): Promise<UserWithAgency[]> {
  const result = await pool.query<UserRow>(
    `SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.banned,
      u.agency_id,
      a.name as agency_name,
      c.name as agency_city,
      u."createdAt" as created_at
    FROM "user" u
    LEFT JOIN agencies a ON u.agency_id = a.id
    LEFT JOIN cities c ON a.city_id = c.id
    ORDER BY u."createdAt" DESC`
  )

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    banned: row.banned,
    agencyId: row.agency_id,
    agencyName: row.agency_name,
    agencyCity: row.agency_city,
    createdAt: row.created_at,
  }))
}

export async function getUsersByAgency(agencyId: string): Promise<UserWithAgency[]> {
  const result = await pool.query<UserRow>(
    `SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.banned,
      u.agency_id,
      a.name as agency_name,
      c.name as agency_city,
      u."createdAt" as created_at
    FROM "user" u
    LEFT JOIN agencies a ON u.agency_id = a.id
    LEFT JOIN cities c ON a.city_id = c.id
    WHERE u.agency_id = $1
    ORDER BY u.name`,
    [agencyId]
  )

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    banned: row.banned,
    agencyId: row.agency_id,
    agencyName: row.agency_name,
    agencyCity: row.agency_city,
    createdAt: row.created_at,
  }))
}

export async function getAdvisors(): Promise<UserWithAgency[]> {
  const result = await pool.query<UserRow>(
    `SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.banned,
      u.agency_id,
      a.name as agency_name,
      c.name as agency_city,
      u."createdAt" as created_at
    FROM "user" u
    LEFT JOIN agencies a ON u.agency_id = a.id
    LEFT JOIN cities c ON a.city_id = c.id
    WHERE u.role = 'asesor' AND (u.banned IS NULL OR u.banned = false)
    ORDER BY a.name, u.name`
  )

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    banned: row.banned,
    agencyId: row.agency_id,
    agencyName: row.agency_name,
    agencyCity: row.agency_city,
    createdAt: row.created_at,
  }))
}
