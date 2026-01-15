'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { pool } from '@/lib/db'
import { auth } from '@/features/auth/server'

export type AgencyFormData = {
  name: string
  city: string
  address: string
}

export async function createAgency(data: AgencyFormData) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'admin') {
    return { error: 'No autorizado' }
  }

  try {
    const result = await pool.query(
      `INSERT INTO agencies (name, city, address)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [data.name, data.city, data.address || null]
    )

    revalidatePath('/admin/settings')
    return { success: true, id: result.rows[0].id }
  } catch (error) {
    console.error('Error creating agency:', error)
    return { error: 'Error al crear la agencia' }
  }
}

export async function updateAgency(agencyId: string, data: AgencyFormData) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'admin') {
    return { error: 'No autorizado' }
  }

  try {
    await pool.query(
      `UPDATE agencies
       SET name = $1, city = $2, address = $3, updated_at = NOW()
       WHERE id = $4`,
      [data.name, data.city, data.address || null, agencyId]
    )

    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('Error updating agency:', error)
    return { error: 'Error al actualizar la agencia' }
  }
}

export async function toggleAgencyStatus(agencyId: string, isActive: boolean) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'admin') {
    return { error: 'No autorizado' }
  }

  try {
    await pool.query(
      `UPDATE agencies SET is_active = $1, updated_at = NOW() WHERE id = $2`,
      [isActive, agencyId]
    )

    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('Error toggling agency status:', error)
    return { error: 'Error al cambiar el estado de la agencia' }
  }
}
