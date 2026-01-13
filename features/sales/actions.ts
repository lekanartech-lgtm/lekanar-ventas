'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { pool } from '@/lib/db'
import { auth } from '@/features/auth/server'
import type { SaleFormData } from './types'

export async function createSale(data: SaleFormData) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return { error: 'No autorizado' }
  }

  try {
    const result = await pool.query(
      `INSERT INTO sales (
        lead_id, full_name, dni, dni_expiry_date, birth_place, birth_date,
        email, phone, phone_owner_name, phone_owner_dni,
        address, address_type, reference, district, province, department,
        latitude, longitude, plan_id, price, score, installation_date, user_id, operator_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24
      )
      RETURNING id`,
      [
        data.leadId || null,
        data.fullName,
        data.dni,
        data.dniExpiryDate,
        data.birthPlace || null,
        data.birthDate || null,
        data.email || null,
        data.phone,
        data.isPhoneOwner ? null : data.phoneOwnerName || null,
        data.isPhoneOwner ? null : data.phoneOwnerDni || null,
        data.address,
        data.addressType,
        data.reference || null,
        data.district,
        data.province,
        data.department,
        data.latitude ? parseFloat(data.latitude) : null,
        data.longitude ? parseFloat(data.longitude) : null,
        data.planId,
        parseFloat(data.price),
        data.score ? parseInt(data.score) : null,
        data.installationDate || null,
        session.user.id,
        data.operatorId || null,
      ]
    )

    if (data.leadId) {
      await pool.query(
        `UPDATE leads SET status = 'converted' WHERE id = $1`,
        [data.leadId]
      )
      revalidatePath('/dashboard/leads')
    }

    revalidatePath('/dashboard/sales')
    return { success: true, id: result.rows[0].id }
  } catch (error) {
    console.error('Error creating sale:', error)
    return { error: 'Error al crear la venta' }
  }
}

export async function updateSale(id: string, data: Partial<SaleFormData>) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return { error: 'No autorizado' }
  }

  try {
    const existing = await pool.query(
      'SELECT user_id FROM sales WHERE id = $1',
      [id]
    )

    if (existing.rows.length === 0) {
      return { error: 'Venta no encontrada' }
    }

    if (existing.rows[0].user_id !== session.user.id) {
      return { error: 'No tienes permiso para editar esta venta' }
    }

    const fields: string[] = []
    const values: (string | number | null)[] = []
    let paramIndex = 1

    const fieldMap: Record<string, string> = {
      fullName: 'full_name',
      dni: 'dni',
      dniExpiryDate: 'dni_expiry_date',
      birthPlace: 'birth_place',
      birthDate: 'birth_date',
      email: 'email',
      phone: 'phone',
      phoneOwnerName: 'phone_owner_name',
      phoneOwnerDni: 'phone_owner_dni',
      address: 'address',
      addressType: 'address_type',
      reference: 'reference',
      district: 'district',
      province: 'province',
      department: 'department',
      planId: 'plan_id',
      score: 'score',
      installationDate: 'installation_date',
      operatorId: 'operator_id',
    }

    for (const [key, dbField] of Object.entries(fieldMap)) {
      const value = data[key as keyof SaleFormData]
      if (value !== undefined) {
        fields.push(`${dbField} = $${paramIndex++}`)
        values.push(value === '' ? null : value as string | number | null)
      }
    }

    if (data.latitude !== undefined) {
      fields.push(`latitude = $${paramIndex++}`)
      values.push(data.latitude ? parseFloat(data.latitude) : null)
    }
    if (data.longitude !== undefined) {
      fields.push(`longitude = $${paramIndex++}`)
      values.push(data.longitude ? parseFloat(data.longitude) : null)
    }
    if (data.price !== undefined) {
      fields.push(`price = $${paramIndex++}`)
      values.push(parseFloat(data.price))
    }

    if (fields.length === 0) {
      return { error: 'No hay campos para actualizar' }
    }

    values.push(id)

    await pool.query(
      `UPDATE sales SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    )

    revalidatePath('/dashboard/sales')
    revalidatePath(`/dashboard/sales/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating sale:', error)
    return { error: 'Error al actualizar la venta' }
  }
}

export type BackofficeUpdateData = {
  score?: number | null
  externalId?: string | null
  contractNumber?: string | null
  requestStatus?: string
  orderStatus?: string
  rejectionReason?: string | null
  installationDate?: string | null
  operatorMetadata?: Record<string, unknown>
}

export async function backofficeUpdateSale(id: string, data: BackofficeUpdateData) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || !['backoffice', 'admin'].includes(session.user.role || '')) {
    return { error: 'No autorizado' }
  }

  try {
    const fields: string[] = []
    const values: (string | number | null)[] = []
    let paramIndex = 1

    if (data.score !== undefined) {
      fields.push(`score = $${paramIndex++}`)
      values.push(data.score)
    }
    if (data.externalId !== undefined) {
      fields.push(`external_id = $${paramIndex++}`)
      values.push(data.externalId || null)
    }
    if (data.contractNumber !== undefined) {
      fields.push(`contract_number = $${paramIndex++}`)
      values.push(data.contractNumber || null)
    }
    if (data.requestStatus !== undefined) {
      fields.push(`request_status = $${paramIndex++}`)
      values.push(data.requestStatus)
    }
    if (data.orderStatus !== undefined) {
      fields.push(`order_status = $${paramIndex++}`)
      values.push(data.orderStatus)
    }
    if (data.rejectionReason !== undefined) {
      fields.push(`rejection_reason = $${paramIndex++}`)
      values.push(data.rejectionReason || null)
    }
    if (data.installationDate !== undefined) {
      fields.push(`installation_date = $${paramIndex++}`)
      values.push(data.installationDate || null)
    }
    if (data.operatorMetadata !== undefined) {
      fields.push(`operator_metadata = $${paramIndex++}`)
      values.push(JSON.stringify(data.operatorMetadata) as unknown as string)
    }

    if (fields.length === 0) {
      return { error: 'No hay campos para actualizar' }
    }

    values.push(id)

    await pool.query(
      `UPDATE sales SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    )

    revalidatePath('/dashboard/backoffice')
    revalidatePath('/dashboard/backoffice/sales')
    revalidatePath(`/dashboard/backoffice/sales/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating sale (backoffice):', error)
    return { error: 'Error al actualizar la venta' }
  }
}
