import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { admin as adminPlugin } from 'better-auth/plugins'
import { pool } from './db'
import { ac, admin, asesor } from './permissions'

export const auth = betterAuth({
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
      roles: {
        admin,
        asesor,
      },
      defaultRole: 'asesor',
    }),
    nextCookies(),
  ],
})

export type Session = typeof auth.$Infer.Session
