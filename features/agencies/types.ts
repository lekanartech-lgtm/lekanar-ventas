export type Agency = {
  id: string
  name: string
  city: string
  address: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type AgencyRow = {
  id: string
  name: string
  city: string
  address: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}
