'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { pool } from '@/lib/db'
import { hashPassword, verifyPassword } from 'better-auth/crypto'
import { auth } from '@/features/auth/server'

export type UpdateUserData = {
  name: string
  email: string
  agencyId: string
}

export type UpdateProfileData = {
  name: string
  email: string
}

export type ChangePasswordData = {
  currentPassword: string
  newPassword: string
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
      [data.name, data.email, data.agencyId || null, userId],
    )

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error updating user:', error)
    return { error: 'Error al actualizar el usuario' }
  }
}

export async function adminUpdateUserPassword(userId: string, newPassword: string) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'admin') {
    return { error: 'No autorizado' }
  }

  if (newPassword.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  try {
    const hashedPassword = await hashPassword(newPassword)

    await pool.query(
      `UPDATE account
       SET password = $1
       WHERE "userId" = $2 AND "providerId" = 'credential'`,
      [hashedPassword, userId],
    )

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error updating user password:', error)
    return { error: 'Error al actualizar la contraseña' }
  }
}

export async function updateProfile(data: UpdateProfileData) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return { error: 'No autorizado' }
  }

  try {
    await pool.query(
      `UPDATE "user"
       SET name = $1, email = $2, "updatedAt" = NOW()
       WHERE id = $3`,
      [data.name, data.email, session.user.id],
    )

    revalidatePath('/dashboard/profile')
    revalidatePath('/admin/profile')
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { error: 'Error al actualizar el perfil' }
  }
}

export async function changePassword(data: ChangePasswordData) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return { error: 'No autorizado' }
  }

  if (data.newPassword.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  try {
    // Get current password hash
    const result = await pool.query<{ password: string }>(
      `SELECT password FROM account
       WHERE "userId" = $1 AND "providerId" = 'credential'`,
      [session.user.id],
    )

    if (result.rows.length === 0) {
      return { error: 'Cuenta no encontrada' }
    }

    // Verify current password
    const isValid = await verifyPassword({
      password: data.currentPassword,
      hash: result.rows[0].password,
    })
    if (!isValid) {
      return { error: 'La contraseña actual es incorrecta' }
    }

    // Update password
    const hashedPassword = await hashPassword(data.newPassword)

    await pool.query(
      `UPDATE account
       SET password = $1
       WHERE "userId" = $2 AND "providerId" = 'credential'`,
      [hashedPassword, session.user.id],
    )

    return { success: true }
  } catch (error) {
    console.error('Error changing password:', error)
    return { error: 'Error al cambiar la contraseña' }
  }
}
