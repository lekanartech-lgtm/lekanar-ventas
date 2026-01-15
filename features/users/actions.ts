'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { pool } from '@/lib/db'
import { auth } from '@/features/auth/server'

export type UpdateUserData = {
  name: string
  email: string
  agencyId: string
}

export async function updateUser(userId: string, data: UpdateUserData) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'admin') {
    return { error: 'No autorizado' }
  }

  try {
    await pool.query(
      `UPDATE "user"
       SET name = $1, email = $2, agency_id = $3, "updatedAt" = NOW()
       WHERE id = $4`,
      [data.name, data.email, data.agencyId || null, userId]
    )

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error updating user:', error)
    return { error: 'Error al actualizar el usuario' }
  }
}
