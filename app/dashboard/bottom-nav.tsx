'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, ShoppingCart, User, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const asesorNavItems = [
  { href: '/dashboard', icon: Home, label: 'Inicio' },
  { href: '/dashboard/leads', icon: Users, label: 'Leads' },
  { href: '/dashboard/sales', icon: ShoppingCart, label: 'Ventas' },
  { href: '/dashboard/profile', icon: User, label: 'Perfil' },
]

const supervisorNavItems = [
  { href: '/dashboard/supervisor', icon: Home, label: 'Equipo' },
  { href: '/dashboard/supervisor/leads', icon: Users, label: 'Leads' },
  { href: '/dashboard/supervisor/sales', icon: ShoppingCart, label: 'Ventas' },
  { href: '/dashboard/profile', icon: User, label: 'Perfil' },
]

const backofficeNavItems = [
  { href: '/dashboard/backoffice', icon: Home, label: 'Inicio' },
  { href: '/dashboard/backoffice/leads', icon: Users, label: 'Leads' },
  { href: '/dashboard/backoffice/sales', icon: ShoppingCart, label: 'Ventas' },
  { href: '/dashboard/profile', icon: User, label: 'Perfil' },
]

type BottomNavProps = {
  role?: string | null
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname()

  const navItems =
    role === 'backoffice'
      ? backofficeNavItems
      : role === 'supervisor'
        ? supervisorNavItems
        : asesorNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="container max-w-lg mx-auto">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 px-4 text-xs transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
