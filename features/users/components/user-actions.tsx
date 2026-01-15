'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { authClient } from '@/features/auth/client'
import { updateUser } from '../actions'
import { ROLE_CONFIG } from '../constants'
import type { UserWithAgency } from '../types'
import type { Agency } from '@/features/agencies'

const roleOptions = Object.entries(ROLE_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}))

type UserActionsProps = {
  user: UserWithAgency
  agencies: Agency[]
}

export function UserActions({ user, agencies }: UserActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selectedAgencyId, setSelectedAgencyId] = useState(user.agencyId || '')

  async function handleRoleChange(newRole: string) {
    setLoading(true)
    await authClient.admin.setRole({
      userId: user.id,
      role: newRole as 'admin',
    })
    router.refresh()
    setLoading(false)
  }

  async function handleBanToggle() {
    setLoading(true)
    if (user.banned) {
      await authClient.admin.unbanUser({ userId: user.id })
    } else {
      await authClient.admin.banUser({ userId: user.id })
    }
    router.refresh()
    setLoading(false)
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateUser(user.id, {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        agencyId: selectedAgencyId,
      })

      if (result.success) {
        setEditOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={loading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar usuario
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Cambiar rol</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {roleOptions.map((role) => (
                <DropdownMenuItem
                  key={role.value}
                  onClick={() => handleRoleChange(role.value)}
                  disabled={user.role === role.value}
                >
                  {role.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleBanToggle}
            className={user.banned ? '' : 'text-destructive'}
          >
            {user.banned ? 'Reactivar usuario' : 'Suspender usuario'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={user.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                defaultValue={user.email}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-agency">Agencia</Label>
              <Select
                value={selectedAgencyId}
                onValueChange={setSelectedAgencyId}
              >
                <SelectTrigger id="edit-agency">
                  <SelectValue placeholder="Seleccionar agencia" />
                </SelectTrigger>
                <SelectContent>
                  {agencies.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                      {agency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
