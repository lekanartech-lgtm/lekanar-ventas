import { createAccessControl } from 'better-auth/plugins/access'
import {
  defaultStatements,
  adminAc,
} from 'better-auth/plugins/admin/access'

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

export const asesor = ac.newRole({
  lead: ['create', 'read', 'update'],
  sale: ['create', 'read'],
})
