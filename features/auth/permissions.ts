import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'

const statement = {
  ...defaultStatements,
  lead: ['create', 'read', 'update', 'delete'],
  sale: ['create', 'read', 'update', 'delete'],
} as const

export const ac = createAccessControl(statement)

export const admin = ac.newRole({
  lead: ['create', 'read', 'update', 'delete'],
  sale: ['create', 'read', 'update', 'delete'],
  ...adminAc.statements,
})

export const supervisor = ac.newRole({
  lead: ['read', 'update'],
  sale: ['read', 'update'],
})

export const asesor = ac.newRole({
  lead: ['create', 'read', 'update'],
  sale: ['create', 'read'],
})

export const backoffice = ac.newRole({
  lead: ['read', 'update'],
  sale: ['read', 'update'],
})

export const roles = {
  admin,
  supervisor,
  asesor,
  backoffice,
} as const

export type Role = keyof typeof roles
