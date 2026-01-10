import { Badge } from '@/components/ui/badge'
import { LEAD_STATUS_CONFIG } from '../constants'
import type { LeadStatus } from '../types'

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = LEAD_STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
