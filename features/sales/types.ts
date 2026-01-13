export type RequestStatus = 'pending' | 'validated' | 'cancelled' | 'rejected' | 'rescue'
export type OrderStatus = 'pending' | 'scheduled' | 'executed' | 'rescue' | 'cancelled'
export type AddressType = 'home' | 'multifamily' | 'condo'

export type Sale = {
  id: string
  leadId: string | null

  fullName: string
  dni: string
  dniExpiryDate: Date
  birthPlace: string | null
  birthDate: Date | null
  email: string | null
  phone: string

  phoneOwnerName: string | null
  phoneOwnerDni: string | null

  address: string
  addressType: AddressType
  reference: string | null
  district: string
  province: string
  department: string
  latitude: number | null
  longitude: number | null

  planId: string
  planName?: string
  price: number

  score: number | null
  installationDate: Date | null
  externalId: string | null
  contractNumber: string | null
  operatorMetadata: Record<string, unknown>

  requestStatus: RequestStatus
  orderStatus: OrderStatus
  rejectionReason: string | null

  userId: string
  userName?: string
  validatedBy: string | null
  validatedAt: Date | null

  operatorId: string | null
  operatorName?: string

  createdAt: Date
  updatedAt: Date
}

export type SaleFormData = {
  leadId?: string

  fullName: string
  dni: string
  dniExpiryDate: string
  birthPlace: string
  birthDate: string
  email: string
  phone: string

  isPhoneOwner: boolean
  phoneOwnerName: string
  phoneOwnerDni: string

  address: string
  addressType: AddressType
  reference: string
  district: string
  province: string
  department: string
  latitude: string
  longitude: string

  planId: string
  price: string

  score: string
  installationDate: string

  operatorId: string
}

export type Plan = {
  id: string
  name: string
  speedMbps: number
  price: number
  commission: number
  isActive: boolean
  operatorId: string | null
  operatorName?: string
}

export type DocumentType = {
  id: string
  operatorId: string | null
  code: string
  name: string
  description: string | null
  isRequired: boolean
  isActive: boolean
  displayOrder: number
}

export type SaleDocument = {
  id: string
  saleId: string
  documentTypeId: string | null
  documentTypeName?: string
  fileUrl: string
  fileName: string | null
  fileSize: number | null
  uploadedAt: Date
}
