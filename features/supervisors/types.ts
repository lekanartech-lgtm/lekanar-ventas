export type SupervisorAdvisor = {
  id: string
  supervisorId: string
  advisorId: string
  createdAt: Date
}

export type TeamMember = {
  id: string
  name: string
  email: string
  agencyId: string | null
  agencyName: string | null
}

export type TeamStats = {
  totalMembers: number
  totalLeads: number
  totalSales: number
  newLeadsToday: number
  salesThisMonth: number
}
