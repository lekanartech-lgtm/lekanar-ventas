export type User = {
  id: string
  name: string
  email: string
  role?: string | null
  banned?: boolean | null
  createdAt: Date
}
