import { pool } from '@/lib/db'
import type { Operator, OperatorRow } from './types'

function mapRowToOperator(row: OperatorRow): Operator {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    logoUrl: row.logo_url,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getOperators(): Promise<Operator[]> {
  const result = await pool.query<OperatorRow>(
    `SELECT * FROM operators WHERE is_active = true ORDER BY name`
  )
  return result.rows.map(mapRowToOperator)
}

export async function getOperatorById(id: string): Promise<Operator | null> {
  const result = await pool.query<OperatorRow>(
    `SELECT * FROM operators WHERE id = $1`,
    [id]
  )
  return result.rows[0] ? mapRowToOperator(result.rows[0]) : null
}

export async function getOperatorByCode(code: string): Promise<Operator | null> {
  const result = await pool.query<OperatorRow>(
    `SELECT * FROM operators WHERE code = $1`,
    [code]
  )
  return result.rows[0] ? mapRowToOperator(result.rows[0]) : null
}
