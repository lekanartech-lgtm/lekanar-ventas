import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { admin as adminPlugin } from 'better-auth/plugins'
import { pool } from '@/lib/db'
import { ac, roles } from './permissions'

export const auth = betterAuth({
  // trustedOrigins: ['http://localhost:3000', 'http://192.168.0.45:3000'],
  trustedOrigins: [
    'http://192.168.0.45:3000',
    'https://2b2bad93a64b.ngrok-free.app',
  ],
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
