'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { pool } from '@/lib/db'
import { auth } from '@/features/auth/server'
import type { AgencyFormData } from './types'

export async function createAgency(data: AgencyFormData) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'admin') {
    return { error: 'No autorizado' }
  }

  try {
    const result = await pool.query(
      `INSERT INTO agencies (name, address, district_id, city_id, state_id, country_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        data.name,
        data.address || null,
        data.districtId || null,
        data.cityId || null,
        data.stateId || null,
        data.countryId || null,
      ]
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
       SET name = $1, address = $2, district_id = $3, city_id = $4, state_id = $5, country_id = $6
       WHERE id = $7`,
      [
        data.name,
        data.address || null,
        data.districtId || null,
        data.cityId || null,
        data.stateId || null,
        data.countryId || null,
        agencyId,
      ]
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
      `UPDATE agencies SET is_active = $1 WHERE id = $2`,
      [isActive, agencyId]
    )

    revalidatePath('/admin/settings')
    return { success: true }
  } catch (error) {
    console.error('Error toggling agency status:', error)
    return { error: 'Error al cambiar el estado de la agencia' }
  }
}
