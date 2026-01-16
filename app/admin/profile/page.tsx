import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/features/auth/server'
import { ProfileForm } from '@/features/users'
import { PageHeader } from '@/components/page-header'

export default async function AdminProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || session.user.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi perfil"
        description="Administra tu información personal y contraseña"
      />

      <div className="max-w-2xl">
        <ProfileForm
          user={{
            name: session.user.name,
            email: session.user.email,
          }}
        />
      </div>
    </div>
  )
}
