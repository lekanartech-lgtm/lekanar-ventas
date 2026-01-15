export type Agency = {
  id: string
  name: string
  address: string | null
  districtId: string | null
  cityId: string | null
  stateId: string | null
  countryId: string | null
  // Joined names
  districtName?: string
  cityName?: string
  stateName?: string
  countryName?: string
  isActive: boolean
  createdAt: Date
}

export type AgencyRow = {
  id: string
  name: string
  address: string | null
  district_id: string | null
  city_id: string | null
  state_id: string | null
  country_id: string | null
  district_name?: string
  city_name?: string
  state_name?: string
  country_name?: string
  is_active: boolean
  created_at: Date
}

export type AgencyFormData = {
  name: string
  address: string
  countryId: string
  stateId: string
  cityId: string
  districtId: string
}

// Re-export location types for convenience
export type { State, City, District } from '@/features/leads/types'
