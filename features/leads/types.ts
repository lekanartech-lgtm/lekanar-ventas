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
  operatorId: string | null
  operatorName?: string
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
}

export type ReferralSource = {
  id: string
  name: string
  isActive: boolean
}
