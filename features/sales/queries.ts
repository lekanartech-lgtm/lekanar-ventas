import { pool } from '@/lib/db'
import type {
  Sale,
  Plan,
  DocumentType,
  RequestStatus,
  OrderStatus,
  AddressType,
} from './types'

type SaleRow = {
  id: string
  lead_id: string | null
  full_name: string
  dni: string
  dni_expiry_date: Date
  birth_place: string | null
  birth_date: Date | null
  email: string | null
  phone: string
  phone_owner_name: string | null
  phone_owner_dni: string | null
  address: string
  address_type: AddressType
  reference: string | null
  district: string
  province: string
  department: string
  latitude: string | null
  longitude: string | null
  plan_id: string
  plan_name: string
  price: string
  score: number | null
  installation_date: Date | null
  external_id: string | null
  contract_number: string | null
  operator_metadata: Record<string, unknown> | null
  request_status: RequestStatus
  order_status: OrderStatus
  rejection_reason: string | null
  user_id: string
  validated_by: string | null
  validated_at: Date | null
  operator_id: string | null
  operator_name: string | null
  created_at: Date
  updated_at: Date
}

function mapRowToSale(row: SaleRow): Sale {
  return {
    id: row.id,
    leadId: row.lead_id,
    fullName: row.full_name,
    dni: row.dni,
    dniExpiryDate: row.dni_expiry_date,
    birthPlace: row.birth_place,
    birthDate: row.birth_date,
    email: row.email,
    phone: row.phone,
    phoneOwnerName: row.phone_owner_name,
    phoneOwnerDni: row.phone_owner_dni,
    address: row.address,
    addressType: row.address_type,
    reference: row.reference,
    district: row.district,
    province: row.province,
    department: row.department,
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null,
    planId: row.plan_id,
    planName: row.plan_name,
    price: parseFloat(row.price),
    score: row.score,
    installationDate: row.installation_date,
    externalId: row.external_id,
    contractNumber: row.contract_number,
    operatorMetadata: row.operator_metadata ?? {},
    requestStatus: row.request_status,
    orderStatus: row.order_status,
    rejectionReason: row.rejection_reason,
    userId: row.user_id,
    validatedBy: row.validated_by,
    validatedAt: row.validated_at,
    operatorId: row.operator_id,
    operatorName: row.operator_name ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getSalesByUserId(userId: string): Promise<Sale[]> {
  const result = await pool.query<SaleRow>(
    `SELECT
      s.*,
      p.name as plan_name,
      o.name as operator_name
    FROM sales s
    JOIN plans p ON s.plan_id = p.id
    LEFT JOIN operators o ON s.operator_id = o.id
    WHERE s.user_id = $1
    ORDER BY s.created_at DESC`,
    [userId],
  )
  return result.rows.map(mapRowToSale)
}

export async function getSaleById(
  id: string,
  userId: string,
): Promise<Sale | null> {
  const result = await pool.query<SaleRow>(
    `SELECT
      s.*,
      p.name as plan_name,
      o.name as operator_name
    FROM sales s
    JOIN plans p ON s.plan_id = p.id
    LEFT JOIN operators o ON s.operator_id = o.id
    WHERE s.id = $1 AND s.user_id = $2`,
    [id, userId],
  )
  return result.rows[0] ? mapRowToSale(result.rows[0]) : null
}

export async function getSalesBySupervisor(
  supervisorId: string,
): Promise<Sale[]> {
  const result = await pool.query<SaleRow>(
    `SELECT
      s.*,
      p.name as plan_name,
      o.name as operator_name
    FROM sales s
    JOIN plans p ON s.plan_id = p.id
    LEFT JOIN operators o ON s.operator_id = o.id
    JOIN supervisor_advisors sa ON s.user_id = sa.advisor_id
    WHERE sa.supervisor_id = $1
    ORDER BY s.created_at DESC`,
    [supervisorId],
  )
  return result.rows.map(mapRowToSale)
}

export async function getAllSales(): Promise<Sale[]> {
  const result = await pool.query<SaleRow & { user_name: string }>(
    `SELECT
      s.*,
      p.name as plan_name,
      o.name as operator_name,
      u.name as user_name
    FROM sales s
    JOIN plans p ON s.plan_id = p.id
    LEFT JOIN operators o ON s.operator_id = o.id
    LEFT JOIN "user" u ON s.user_id = u.id
    ORDER BY s.created_at DESC`,
  )
  return result.rows.map((row) => ({
    ...mapRowToSale(row),
    userName: row.user_name,
  }))
}

export async function getPlans(): Promise<Plan[]> {
  const result = await pool.query<{
    id: string
    name: string
    speed_mbps: number
    price: string
    commission: string
    is_active: boolean
    operator_id: string | null
    operator_name: string | null
  }>(`SELECT p.*, o.name as operator_name
      FROM plans p
      LEFT JOIN operators o ON p.operator_id = o.id
      WHERE p.is_active = true
      ORDER BY o.name, p.price`)

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    speedMbps: row.speed_mbps,
    price: parseFloat(row.price),
    commission: parseFloat(row.commission),
    isActive: row.is_active,
    operatorId: row.operator_id,
    operatorName: row.operator_name ?? undefined,
  }))
}

export async function getPlansByOperator(operatorId: string): Promise<Plan[]> {
  const result = await pool.query<{
    id: string
    name: string
    speed_mbps: number
    price: string
    commission: string
    is_active: boolean
    operator_id: string | null
    operator_name: string | null
  }>(
    `SELECT p.*, o.name as operator_name
      FROM plans p
      LEFT JOIN operators o ON p.operator_id = o.id
      WHERE p.is_active = true AND p.operator_id = $1
      ORDER BY p.price`,
    [operatorId],
  )

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    speedMbps: row.speed_mbps,
    price: parseFloat(row.price),
    commission: parseFloat(row.commission),
    isActive: row.is_active,
    operatorId: row.operator_id,
    operatorName: row.operator_name ?? undefined,
  }))
}

export async function getSaleByIdForBackoffice(
  id: string,
): Promise<(Sale & { userName?: string }) | null> {
  const result = await pool.query<SaleRow & { user_name: string }>(
    `SELECT
      s.*,
      p.name as plan_name,
      o.name as operator_name,
      u.name as user_name
    FROM sales s
    JOIN plans p ON s.plan_id = p.id
    LEFT JOIN operators o ON s.operator_id = o.id
    LEFT JOIN "user" u ON s.user_id = u.id
    WHERE s.id = $1`,
    [id],
  )
  if (!result.rows[0]) return null
  return {
    ...mapRowToSale(result.rows[0]),
    userName: result.rows[0].user_name,
  }
}

export async function getDocumentTypesByOperator(
  operatorId: string,
): Promise<DocumentType[]> {
  const result = await pool.query<{
    id: string
    operator_id: string | null
    code: string
    name: string
    description: string | null
    is_required: boolean
    is_active: boolean
    display_order: number
  }>(
    `SELECT * FROM document_types
     WHERE operator_id = $1 AND is_active = true
     ORDER BY display_order`,
    [operatorId],
  )

  return result.rows.map((row) => ({
    id: row.id,
    operatorId: row.operator_id,
    code: row.code,
    name: row.name,
    description: row.description,
    isRequired: row.is_required,
    isActive: row.is_active,
    displayOrder: row.display_order,
  }))
}
