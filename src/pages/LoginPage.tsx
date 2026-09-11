import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { GearSightLogo } from '@/components/brand/GearSightLogo'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('account@gmail.com')
  const [role, setRole] = useState<UserRole>('safety_officer')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    login(email, role)
    navigate('/')
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,#ffedd5,transparent_40%),radial-gradient(circle_at_bottom_right,#e5e7eb,transparent_45%),#f4f5f7] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
        <div className="mb-8">
          <GearSightLogo variant="onLight" />
          <p className="mt-3 text-sm text-gray-500">
            AI-Assisted PPE Compliance System
          </p>
        </div>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#FF6A1A]"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">
            Role
          </span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#FF6A1A]"
          >
            <option value="safety_officer">Safety Officer</option>
            <option value="site_engineer">Site / Project Engineer</option>
          </select>
        </label>

        <Button type="submit" className="w-full !bg-[#FF6A1A] hover:!brightness-105">
          Login
        </Button>
        <p className="mt-4 text-center text-xs text-gray-400">
          Frontend demo — mock auth only. No password required.
        </p>
      </form>
    </div>
  )
}
