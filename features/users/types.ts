export type User = {
  id: string
  name: string
  email: string
  role?: string | null
  banned?: boolean | null
  createdAt: Date
}

export type UserWithAgency = User & {
  agencyId: string | null
  agencyName: string | null
  agencyCity: string | null
}
