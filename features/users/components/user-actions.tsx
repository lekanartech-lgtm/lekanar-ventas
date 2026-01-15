'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal } from 'lucide-react'
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
import { authClient } from '@/features/auth/client'
import { ROLE_CONFIG } from '../constants'
import type { UserWithAgency } from '../types'

const roleOptions = Object.entries(ROLE_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}))

export function UserActions({ user }: { user: UserWithAgency }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={loading}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />

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
  )
}
