import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-950">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Account preferences for the PPE compliance workspace.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm text-gray-500">Signed in as</p>
          <p className="text-lg font-bold">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="font-semibold capitalize">
            {user?.role.replaceAll('_', ' ')}
          </p>
        </div>
        <Button
          variant="dark"
          type="button"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          Log out
        </Button>
      </section>
    </div>
  )
}
