'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { pool } from '@/lib/db'
import { auth } from '@/features/auth/server'

export async function assignAdvisorToSupervisor(advisorId: string) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'supervisor') {
    return { error: 'No autorizado' }
  }

  try {
    await pool.query(
      `INSERT INTO supervisor_advisors (supervisor_id, advisor_id)
       VALUES ($1, $2)
       ON CONFLICT (supervisor_id, advisor_id) DO NOTHING`,
      [session.user.id, advisorId]
    )

    revalidatePath('/dashboard/supervisor')
    revalidatePath('/dashboard/supervisor/team')
    return { success: true }
  } catch (error) {
    console.error('Error assigning advisor:', error)
    return { error: 'Error al asignar asesor' }
  }
}

export async function removeAdvisorFromSupervisor(advisorId: string) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'supervisor') {
    return { error: 'No autorizado' }
  }

  try {
    await pool.query(
      `DELETE FROM supervisor_advisors
       WHERE supervisor_id = $1 AND advisor_id = $2`,
      [session.user.id, advisorId]
    )

    revalidatePath('/dashboard/supervisor')
    revalidatePath('/dashboard/supervisor/team')
    return { success: true }
  } catch (error) {
    console.error('Error removing advisor:', error)
    return { error: 'Error al remover asesor' }
  }
}

// Admin action to assign advisors to any supervisor
export async function adminAssignAdvisor(supervisorId: string, advisorId: string) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'admin') {
    return { error: 'No autorizado' }
  }

  try {
    await pool.query(
      `INSERT INTO supervisor_advisors (supervisor_id, advisor_id)
       VALUES ($1, $2)
       ON CONFLICT (supervisor_id, advisor_id) DO NOTHING`,
      [supervisorId, advisorId]
    )

    revalidatePath('/admin/assignments')
    return { success: true }
  } catch (error) {
    console.error('Error assigning advisor:', error)
    return { error: 'Error al asignar asesor' }
  }
}

export async function adminRemoveAdvisor(supervisorId: string, advisorId: string) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'admin') {
    return { error: 'No autorizado' }
  }

  try {
    await pool.query(
      `DELETE FROM supervisor_advisors
       WHERE supervisor_id = $1 AND advisor_id = $2`,
      [supervisorId, advisorId]
    )

    revalidatePath('/admin/assignments')
    return { success: true }
  } catch (error) {
    console.error('Error removing advisor:', error)
    return { error: 'Error al remover asesor' }
  }
}
