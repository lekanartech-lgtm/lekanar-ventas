'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, X } from 'lucide-react'
import { LeadForm } from './lead-form'
import type { Operator } from '@/features/operators'
import type { ReferralSource, State } from '../types'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type LeadCreationWizardProps = {
  operators: Operator[]
  referralSources: ReferralSource[]
  states: State[]
}

type Step = 'selection' | 'form'

export function LeadCreationWizard({
  operators,
  referralSources,
  states,
}: LeadCreationWizardProps) {
  const [step, setStep] = useState<Step>('selection')
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('')

  const handleOperatorSelect = (operatorId: string) => {
    setSelectedOperatorId(operatorId)
    setStep('form')
  }

  const handleBack = () => {
    setStep('selection')
    setSelectedOperatorId('')
  }

  const selectedOperator = operators.find((op) => op.id === selectedOperatorId)

  if (step === 'selection') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-center">
            Selecciona un operador
          </h1>
          <p className="text-muted-foreground text-center">
            Elige el operador para el cual deseas registrar el nuevo lead.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {operators.map((operator) => (
            <Card
              key={operator.id}
              className={cn(
                'cursor-pointer transition-all w-64 hover:shadow-md hover:border-primary group',
                operator.isActive
                  ? 'opacity-100'
                  : 'opacity-50 pointer-events-none'
              )}
              onClick={() => handleOperatorSelect(operator.id)}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 gap-4 text-center h-full">
                <div className="w-16 h-16 relative flex items-center justify-center bg-muted rounded-full overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  {operator.logoUrl ? (
                    <Image
                      src={operator.logoUrl}
                      alt={operator.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">
                      {operator.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{operator.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {operator.code}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between p-4 rounded-md border-2 border-sky-400 bg-white">
        <h2 className="text-center text-xl">{selectedOperator?.name}</h2>
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <X />
        </Button>
      </div>

      <LeadForm
        referralSources={referralSources}
        operators={operators}
        states={states}
        preselectedOperatorId={selectedOperatorId}
      />
    </div>
  )
}
