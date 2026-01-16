'use client'

import Link from 'next/link'
import { Phone, MessageCircle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { URGENCY_CONFIG } from '../constants'
import type { AgendaLead } from '../types'

type AgendaLeadCardProps = {
  lead: AgendaLead
  isCurrentSlot?: boolean
}

export function AgendaLeadCard({ lead, isCurrentSlot }: AgendaLeadCardProps) {
  const urgencyConfig = URGENCY_CONFIG[lead.urgencyLevel]
  const whatsappUrl = `https://wa.me/51${lead.phone.replace(/\D/g, '')}`

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        lead.urgencyLevel === 'critical' &&
          'border-l-4 border-l-destructive bg-destructive/5',
        lead.urgencyLevel === 'high' &&
          'border-l-4 border-l-orange-500 bg-orange-50',
        lead.urgencyLevel === 'normal' && isCurrentSlot && 'border-l-4 border-l-primary bg-primary/5',
        lead.urgencyLevel === 'normal' && !isCurrentSlot && 'border-l-2 border-l-muted'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {lead.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium truncate">{lead.fullName}</p>
                {urgencyConfig.label && (
                  <Badge
                    variant={urgencyConfig.color === 'destructive' ? 'destructive' : 'outline'}
                    className={cn(
                      'text-xs',
                      urgencyConfig.color === 'warning' &&
                        'border-orange-500 text-orange-600 bg-orange-50'
                    )}
                  >
                    {urgencyConfig.label}
                    {lead.daysOverdue > 0 && ` (${lead.daysOverdue}d)`}
                  </Badge>
                )}
              </div>
              {lead.operatorName && (
                <p className="text-xs text-muted-foreground">{lead.operatorName}</p>
              )}
            </div>
          </div>
        </div>

        <a
          href={`tel:${lead.phone}`}
          className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <Phone className="h-4 w-4 text-primary" />
          <span className="font-medium text-lg">{lead.phone}</span>
        </a>

        {lead.notes && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {lead.notes}
          </p>
        )}

        <div className="flex items-center gap-2 mt-3">
          <Button size="sm" className="flex-1" asChild>
            <a href={`tel:${lead.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Llamar
            </a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
            </a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/dashboard/leads/${lead.id}/edit`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
