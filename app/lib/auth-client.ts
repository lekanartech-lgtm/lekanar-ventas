'use client'

import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { ac, admin, asesor } from './permissions'

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        asesor,
      },
    }),
  ],
})

export const { signIn, signOut, useSession } = authClient
