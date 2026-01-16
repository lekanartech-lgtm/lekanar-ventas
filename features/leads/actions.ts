'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { pool } from '@/lib/db'
import { auth } from '@/features/auth/server'
import type { LeadFormData, City, District } from './types'

// Location actions (for client components)
export async function fetchCitiesByState(stateId: string): Promise<City[]> {
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

export async function fetchDistrictsByCity(
  cityId: string,
): Promise<District[]> {
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

export async function createLead(data: LeadFormData) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return { error: 'No autorizado' }
  }

  try {
    const result = await pool.query(
      `INSERT INTO leads (
        full_name, dni, phone, contact_date, contact_time_preference,
        referral_source_id, current_operator, notes, user_id, operator_id,
        address, district_id, latitude, longitude, reference
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id`,
      [
        data.fullName,
        data.dni,
        data.phone,
        data.contactDate || new Date().toISOString().split('T')[0],
        data.contactTimePreference || null,
        data.referralSourceId || null,
        data.currentOperator || null,
        data.notes || null,
        session.user.id,
        data.operatorId || null,
        data.address || null,
        data.districtId || null,
        data.latitude ? parseFloat(data.latitude) : null,
        data.longitude ? parseFloat(data.longitude) : null,
        data.reference || null,
      ],
    )

    revalidatePath('/dashboard/leads')
    return { success: true, id: result.rows[0].id }
  } catch (error) {
    console.error('Error creating lead:', error)
    return { error: 'Error al crear el lead' }
  }
}

export async function updateLead(id: string, data: Partial<LeadFormData>) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return { error: 'No autorizado' }
  }

  try {
    const existing = await pool.query(
      'SELECT user_id FROM leads WHERE id = $1',
      [id],
    )

    if (existing.rows.length === 0) {
      return { error: 'Lead no encontrado' }
    }

    if (existing.rows[0].user_id !== session.user.id) {
      return { error: 'No tienes permiso para editar este lead' }
    }

    const fields: string[] = []
    const values: (string | null)[] = []
    let paramIndex = 1

    if (data.fullName !== undefined) {
      fields.push(`full_name = $${paramIndex++}`)
      values.push(data.fullName)
    }
    if (data.dni !== undefined) {
      fields.push(`dni = $${paramIndex++}`)
      values.push(data.dni)
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`)
      values.push(data.phone)
    }
    if (data.contactDate !== undefined) {
      fields.push(`contact_date = $${paramIndex++}`)
      values.push(data.contactDate)
    }
    if (data.contactTimePreference !== undefined) {
      fields.push(`contact_time_preference = $${paramIndex++}`)
      values.push(data.contactTimePreference || null)
    }
    if (data.referralSourceId !== undefined) {
      fields.push(`referral_source_id = $${paramIndex++}`)
      values.push(data.referralSourceId || null)
    }
    if (data.currentOperator !== undefined) {
      fields.push(`current_operator = $${paramIndex++}`)
      values.push(data.currentOperator || null)
    }
    if (data.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`)
      values.push(data.notes || null)
    }
    if (data.operatorId !== undefined) {
      fields.push(`operator_id = $${paramIndex++}`)
      values.push(data.operatorId || null)
    }
    if (data.address !== undefined) {
      fields.push(`address = $${paramIndex++}`)
      values.push(data.address || null)
    }
    if (data.districtId !== undefined) {
      fields.push(`district_id = $${paramIndex++}`)
      values.push(data.districtId || null)
    }
    if (data.latitude !== undefined) {
      fields.push(`latitude = $${paramIndex++}`)
      values.push(data.latitude ? parseFloat(data.latitude).toString() : null)
    }
    if (data.longitude !== undefined) {
      fields.push(`longitude = $${paramIndex++}`)
      values.push(data.longitude ? parseFloat(data.longitude).toString() : null)
    }
    if (data.reference !== undefined) {
      fields.push(`reference = $${paramIndex++}`)
      values.push(data.reference || null)
    }

    if (fields.length === 0) {
      return { error: 'No hay campos para actualizar' }
    }

    values.push(id)

    await pool.query(
      `UPDATE leads SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values,
    )

    revalidatePath('/dashboard/leads')
    revalidatePath(`/dashboard/leads/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating lead:', error)
    return { error: 'Error al actualizar el lead' }
  }
}

export async function deleteLead(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return { error: 'No autorizado' }
  }

  try {
    const existing = await pool.query(
      'SELECT user_id FROM leads WHERE id = $1',
      [id],
    )

    if (existing.rows.length === 0) {
      return { error: 'Lead no encontrado' }
    }

    if (existing.rows[0].user_id !== session.user.id) {
      return { error: 'No tienes permiso para eliminar este lead' }
    }

    await pool.query('DELETE FROM leads WHERE id = $1', [id])

    revalidatePath('/dashboard/leads')
    return { success: true }
  } catch (error) {
    console.error('Error deleting lead:', error)
    return { error: 'Error al eliminar el lead' }
  }
}

export async function adminUpdateLead(id: string, data: Partial<LeadFormData>) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'admin') {
    return { error: 'No autorizado' }
  }

  try {
    const existing = await pool.query('SELECT id FROM leads WHERE id = $1', [
      id,
    ])

    if (existing.rows.length === 0) {
      return { error: 'Lead no encontrado' }
    }

    const fields: string[] = []
    const values: (string | null)[] = []
    let paramIndex = 1

    if (data.fullName !== undefined) {
      fields.push(`full_name = $${paramIndex++}`)
      values.push(data.fullName)
    }
    if (data.dni !== undefined) {
      fields.push(`dni = $${paramIndex++}`)
      values.push(data.dni)
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`)
      values.push(data.phone)
    }
    if (data.contactDate !== undefined) {
      fields.push(`contact_date = $${paramIndex++}`)
      values.push(data.contactDate)
    }
    if (data.contactTimePreference !== undefined) {
      fields.push(`contact_time_preference = $${paramIndex++}`)
      values.push(data.contactTimePreference || null)
    }
    if (data.referralSourceId !== undefined) {
      fields.push(`referral_source_id = $${paramIndex++}`)
      values.push(data.referralSourceId || null)
    }
    if (data.currentOperator !== undefined) {
      fields.push(`current_operator = $${paramIndex++}`)
      values.push(data.currentOperator || null)
    }
    if (data.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`)
      values.push(data.notes || null)
    }
    if (data.operatorId !== undefined) {
      fields.push(`operator_id = $${paramIndex++}`)
      values.push(data.operatorId || null)
    }
    if (data.address !== undefined) {
      fields.push(`address = $${paramIndex++}`)
      values.push(data.address || null)
    }
    if (data.districtId !== undefined) {
      fields.push(`district_id = $${paramIndex++}`)
      values.push(data.districtId || null)
    }
    if (data.latitude !== undefined) {
      fields.push(`latitude = $${paramIndex++}`)
      values.push(data.latitude ? parseFloat(data.latitude).toString() : null)
    }
    if (data.longitude !== undefined) {
      fields.push(`longitude = $${paramIndex++}`)
      values.push(data.longitude ? parseFloat(data.longitude).toString() : null)
    }
    if (data.reference !== undefined) {
      fields.push(`reference = $${paramIndex++}`)
      values.push(data.reference || null)
    }

    if (fields.length === 0) {
      return { error: 'No hay campos para actualizar' }
    }

    values.push(id)

    await pool.query(
      `UPDATE leads SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
      values,
    )

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating lead:', error)
    return { error: 'Error al actualizar el lead' }
  }
}
