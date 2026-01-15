'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { updateOperator, toggleOperatorStatus } from '../actions'
import type { Operator } from '../types'

type OperatorActionsProps = {
  operator: Operator
}

export function OperatorActions({ operator }: OperatorActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState('')

  function handleToggleStatus() {
    startTransition(async () => {
      const result = await toggleOperatorStatus(operator.id, !operator.isActive)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      logoUrl: formData.get('logoUrl') as string,
    }

    startTransition(async () => {
      const result = await updateOperator(operator.id, data)
      if (result.error) {
        setError(result.error)
      } else {
        setEditOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus} disabled={isPending}>
            <Power className="mr-2 h-4 w-4" />
            {operator.isActive ? 'Desactivar' : 'Activar'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar operador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={operator.name}
                placeholder="Nombre del operador"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-code">Código *</Label>
              <Input
                id="edit-code"
                name="code"
                defaultValue={operator.code}
                placeholder="CÓDIGO"
                required
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Identificador único del operador (ej: CLARO, MOVISTAR)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-logoUrl">URL del logo</Label>
              <Input
                id="edit-logoUrl"
                name="logoUrl"
                defaultValue={operator.logoUrl || ''}
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
