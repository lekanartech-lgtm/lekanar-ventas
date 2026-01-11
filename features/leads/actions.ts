'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { pool } from '@/lib/db'
import { auth } from '@/features/auth/server'
import type { LeadFormData } from './types'

export async function createLead(data: LeadFormData) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return { error: 'No autorizado' }
  }

  try {
    const result = await pool.query(
      `INSERT INTO leads (
        full_name, dni, phone, contact_date, contact_time_preference,
        referral_source_id, current_operator, notes, user_id, operator_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
      ]
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
      [id]
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

    if (fields.length === 0) {
      return { error: 'No hay campos para actualizar' }
    }

    values.push(id)

    await pool.query(
      `UPDATE leads SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
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
      [id]
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
