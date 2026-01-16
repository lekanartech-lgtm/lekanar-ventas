import { auth } from '@/features/auth'

const VALID_ROLES = ['admin', 'supervisor', 'asesor', 'backoffice'] as const

async function createUser() {
  const args = process.argv.slice(2)

  if (args.length < 3) {
    console.error(`
Usage: npx tsx scripts/create-user.ts <role> <email> <password> [name]

Roles: ${VALID_ROLES.join(', ')}

Example:
  npx tsx scripts/create-user.ts admin admin@empresa.com secretpass123 "Juan Admin"
  npx tsx scripts/create-user.ts asesor carlos@empresa.com pass12345 "Carlos Pérez"
`)
    process.exit(1)
  }

  const [role, email, password, name = email.split('@')[0]] = args

  if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
    console.error(
      `Invalid role: ${role}. Valid roles: ${VALID_ROLES.join(', ')}`,
    )
    process.exit(1)
  }

  try {
    const result = await auth.api.createUser({
      body: {
        email,
        password,
        name,
        role: role as 'admin',
      },
    })

    console.log(`User created successfully:`)
    console.log(`  Email: ${result.user.email}`)
    console.log(`  Name:  ${result.user.name}`)
    console.log(`  Role:  ${role}`)
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message)
    } else {
      console.error('Error:', error)
    }
    process.exit(1)
  }

  process.exit(0)
}

createUser()
