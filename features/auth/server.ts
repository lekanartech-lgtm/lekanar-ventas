import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { admin as adminPlugin } from 'better-auth/plugins'
import { pool } from '@/lib/db'
import { ac, roles } from './permissions'

const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(',') || [
  'http://localhost:3000',
]

export const auth = betterAuth({
  trustedOrigins,
  database: pool,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  plugins: [
    adminPlugin({
      ac,
      roles,
      defaultRole: 'asesor',
    }),
    nextCookies(),
  ],
})

export type Session = typeof auth.$Infer.Session
