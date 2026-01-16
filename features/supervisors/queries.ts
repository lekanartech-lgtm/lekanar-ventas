import { pool } from '@/lib/db'
import type { TeamMember, TeamStats } from './types'

type TeamMemberRow = {
  id: string
  name: string
  email: string
  agency_id: string | null
  agency_name: string | null
}

function mapRowToTeamMember(row: TeamMemberRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    agencyId: row.agency_id,
    agencyName: row.agency_name,
  }
}

export async function getTeamMembersBySupervisor(
  supervisorId: string,
): Promise<TeamMember[]> {
  const result = await pool.query<TeamMemberRow>(
    `SELECT u.id, u.name, u.email, u.agency_id, a.name as agency_name
     FROM "user" u
     LEFT JOIN agencies a ON u.agency_id = a.id
     JOIN supervisor_advisors sa ON sa.advisor_id = u.id
     WHERE sa.supervisor_id = $1
     ORDER BY a.name NULLS LAST, u.name`,
    [supervisorId],
  )
  return result.rows.map(mapRowToTeamMember)
}

export async function getTeamStatsBySupervisor(
  supervisorId: string,
): Promise<TeamStats> {
  const membersResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM supervisor_advisors WHERE supervisor_id = $1`,
    [supervisorId],
  )

  const leadsResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM leads l
     JOIN supervisor_advisors sa ON l.user_id = sa.advisor_id
     WHERE sa.supervisor_id = $1`,
    [supervisorId],
  )

  const salesResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM sales s
     JOIN supervisor_advisors sa ON s.user_id = sa.advisor_id
     WHERE sa.supervisor_id = $1`,
    [supervisorId],
  )

  const newLeadsTodayResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM leads l
     JOIN supervisor_advisors sa ON l.user_id = sa.advisor_id
     WHERE sa.supervisor_id = $1
     AND l.created_at::date = CURRENT_DATE`,
    [supervisorId],
  )

  const salesThisMonthResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM sales s
     JOIN supervisor_advisors sa ON s.user_id = sa.advisor_id
     WHERE sa.supervisor_id = $1
     AND s.created_at >= date_trunc('month', CURRENT_DATE)`,
    [supervisorId],
  )

  return {
    totalMembers: parseInt(membersResult.rows[0].count),
    totalLeads: parseInt(leadsResult.rows[0].count),
    totalSales: parseInt(salesResult.rows[0].count),
    newLeadsToday: parseInt(newLeadsTodayResult.rows[0].count),
    salesThisMonth: parseInt(salesThisMonthResult.rows[0].count),
  }
}

export async function getAdvisorsNotAssignedToSupervisor(
  supervisorId: string,
): Promise<TeamMember[]> {
  const result = await pool.query<TeamMemberRow>(
    `SELECT u.id, u.name, u.email, u.agency_id, a.name as agency_name
     FROM "user" u
     LEFT JOIN agencies a ON u.agency_id = a.id
     WHERE u.role = 'asesor'
     AND u.id NOT IN (
       SELECT advisor_id FROM supervisor_advisors WHERE supervisor_id = $1
     )
     ORDER BY a.name NULLS LAST, u.name`,
    [supervisorId],
  )
  return result.rows.map(mapRowToTeamMember)
}
