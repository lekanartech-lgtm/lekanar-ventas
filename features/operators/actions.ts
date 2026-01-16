'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { pool } from '@/lib/db'
import { auth } from '@/features/auth/server'
import type { OperatorFormData } from './types'

export async function createOperator(data: OperatorFormData) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'admin') {
    return { error: 'No autorizado' }
  }

  try {
    // Check if code already exists
    const existing = await pool.query(
      'SELECT id FROM operators WHERE code = $1',
      [data.code.toUpperCase()],
    )

    if (existing.rows.length > 0) {
      return { error: 'Ya existe un operador con ese código' }
    }

    const result = await pool.query(
      `INSERT INTO operators (name, code, logo_url)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [data.name, data.code.toUpperCase(), data.logoUrl || null],
    )

    revalidatePath('/admin/settings')
    return { success: true, id: result.rows[0].id }
  } catch (error) {
    console.error('Error creating operator:', error)
    return { error: 'Error al crear el operador' }
  }
}

export async function updateOperator(
  operatorId: string,
  data: OperatorFormData,
) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'admin') {
    return { error: 'No autorizado' }
  }

  try {
    // Check if code already exists for another operator
    const existing = await pool.query(
      'SELECT id FROM operators WHERE code = $1 AND id != $2',
      [data.code.toUpperCase(), operatorId],
    )

    if (existing.rows.length > 0) {
      return { error: 'Ya existe otro operador con ese código' }
    }

    await pool.query(
      `UPDATE operators
       SET name = $1, code = $2, logo_url = $3, updated_at = NOW()
       WHERE id = $4`,
      [data.name, data.code.toUpperCase(), data.logoUrl || null, operatorId],
    )

    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('Error updating operator:', error)
    return { error: 'Error al actualizar el operador' }
  }
}

export async function toggleOperatorStatus(
  operatorId: string,
  isActive: boolean,
) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'admin') {
    return { error: 'No autorizado' }
  }

  try {
    await pool.query(
      `UPDATE operators SET is_active = $1, updated_at = NOW() WHERE id = $2`,
      [isActive, operatorId],
    )

    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('Error toggling operator status:', error)
    return { error: 'Error al cambiar el estado del operador' }
  }
}
