import { UsersTable, CreateUserDialog, getUsersWithAgency } from '@/features/users'
import { PageHeader } from '@/components/page-header'

export default async function UsersPage() {
  const users = await getUsersWithAgency()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Gestiona los usuarios y sus permisos"
      >
        <CreateUserDialog />
      </PageHeader>

      <UsersTable users={users} />
    </div>
  )
}
