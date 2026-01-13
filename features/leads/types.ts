export type LeadStatus = 'new' | 'converted'

export type Lead = {
  id: string
  fullName: string
  dni: string
  phone: string
  contactDate: Date
  contactTimePreference: string | null
  referralSourceId: string | null
  referralSourceName?: string
  currentOperator: string | null
  notes: string | null
  status: LeadStatus
  userId: string
  userName?: string
  operatorId: string | null
  operatorName?: string
  // Address fields
  address: string | null
  districtId: string | null
  districtName?: string
  cityName?: string
  stateName?: string
  latitude: number | null
  longitude: number | null
  reference: string | null
  createdAt: Date
  updatedAt: Date
}

export type LeadFormData = {
  fullName: string
  dni: string
  phone: string
  contactDate: string
  contactTimePreference: string
  referralSourceId: string
  currentOperator: string
  notes: string
  operatorId: string
  // Address fields
  address: string
  stateId: string
  cityId: string
  districtId: string
  latitude: string
  longitude: string
  reference: string
}

export type ReferralSource = {
  id: string
  name: string
  isActive: boolean
}

// Location types
export type Country = {
  id: string
  name: string
  isActive: boolean
}

export type State = {
  id: string
  countryId: string
  name: string
  isActive: boolean
}

export type City = {
  id: string
  stateId: string
  name: string
  isActive: boolean
}

export type District = {
  id: string
  cityId: string
  stateId: string | null
  name: string
  isActive: boolean
}
