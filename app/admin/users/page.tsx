import { UsersTable, CreateUserDialog, getUsersWithAgency } from '@/features/users'

export default async function UsersPage() {
  const users = await getUsersWithAgency()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios y sus permisos
          </p>
        </div>
        <CreateUserDialog />
      </div>

      <UsersTable users={users} />
    </div>
  )
}
