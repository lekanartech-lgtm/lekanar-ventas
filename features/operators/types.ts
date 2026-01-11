export type Operator = {
  id: string
  name: string
  code: string
  logoUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type OperatorRow = {
  id: string
  name: string
  code: string
  logo_url: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}
