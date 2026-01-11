import { Badge } from '@/components/ui/badge'
import { REQUEST_STATUS_CONFIG, ORDER_STATUS_CONFIG } from '../constants'
import type { RequestStatus, OrderStatus } from '../types'

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const config = REQUEST_STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = ORDER_STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
