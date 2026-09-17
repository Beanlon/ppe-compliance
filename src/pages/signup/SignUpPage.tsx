import { useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  MapPin,
  RefreshCw,
  Shield,
  Video,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { GearSightLogo } from '@/components/brand/GearSightLogo'
import {
  DEFAULT_CENTER,
  SiteMapPicker,
  type LatLng,
} from './components/SiteMapPicker'
import { CameraDevicePicker } from './components/CameraDevicePicker'
import { PPE_ICON_MAP, type PpeIconName } from './components/PpeIcons'

const STEPS = [
  {
    id: 1,
    label: 'Site Information',
    description: 'Pin the location and choose required PPE.',
    icon: MapPin,
  },
  {
    id: 2,
    label: 'Login Credentials',
    description: 'Create the account that manages this site.',
    icon: Shield,
  },
  {
    id: 3,
    label: 'Camera Setup',
    description: 'Connect a camera from this machine.',
    icon: Video,
  },
] as const

const PPE_OPTIONS: {
  id: string
  label: string
  icon: PpeIconName
}[] = [
  { id: 'safety-vest', label: 'Safety Vest / Shirt', icon: 'vest' },
  { id: 'safety-shoes', label: 'Safety Shoes', icon: 'shoes' },
  { id: 'gloves', label: 'Gloves', icon: 'gloves' },
  { id: 'harness', label: 'Harness', icon: 'harness' },
  { id: 'hard-hat', label: 'Hard Hat', icon: 'hat' },
]

function makeProjectId() {
  return (
    'PRJ-' +
    Math.floor(1000 + Math.random() * 9000) +
    '-' +
    Math.random().toString(36).slice(2, 5).toUpperCase()
  )
}

export function SignUpPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  const [mapPosition, setMapPosition] = useState<LatLng>(DEFAULT_CENTER)
  const [address, setAddress] = useState(
    'A.M. Mata Compound Maligaya Avenue, Matina Davao City',
  )
  const [selectedPpe, setSelectedPpe] = useState<string[]>([
    'safety-vest',
    'safety-shoes',
    'gloves',
  ])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [projectName, setProjectName] = useState('')
  const [projectId, setProjectId] = useState(makeProjectId)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [selectedCameraId, setSelectedCameraId] = useState('')
  const [selectedCameraLabel, setSelectedCameraLabel] = useState('')

  const current = STEPS.find((s) => s.id === step) ?? STEPS[0]

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  function togglePpe(id: string) {
    setSelectedPpe((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function go(dir: -1 | 1) {
    const next = step + dir
    if (next < 1 || next > STEPS.length) return
    if (dir === 1 && step === STEPS.length) {
      if (selectedCameraLabel) {
        sessionStorage.setItem('gearsight.cameraLabel', selectedCameraLabel)
      }
      if (selectedCameraId) {
        sessionStorage.setItem('gearsight.cameraId', selectedCameraId)
      }
      login(email || 'account@gmail.com', 'safety_officer')
      navigate('/')
      return
    }
    setStep(next)
  }

  return (
    <div className="flex min-h-full w-full flex-col lg:h-full lg:min-h-screen lg:flex-row">
      {/* Left rail — brand + vertical steps */}
      <aside className="relative flex w-full flex-col overflow-hidden bg-gradient-to-b from-navy via-[#24314d] to-[#1a2238] px-6 py-7 text-white sm:px-8 lg:w-[380px] lg:shrink-0 lg:px-9 lg:py-10 xl:w-[420px]">
        <div
          className="pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-[#4ade80]/10 blur-3xl"
          aria-hidden
        />

        <GearSightLogo
          variant="onDark"
          className="relative [&>span]:text-2xl [&>svg]:h-9"
        />

        <div className="relative mt-10 hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent sm:text-sm">
            Site onboarding
          </p>
          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            Set up your monitored project
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
            Three quick steps to pin the site, create access, and connect a
            live camera feed.
          </p>
        </div>

        <nav className="relative mt-8 flex gap-2 overflow-x-auto pb-1 lg:mt-12 lg:flex-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
          {STEPS.map((s, i) => {
            const active = s.id === step
            const done = s.id < step
            const Icon = s.icon
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex min-w-[9.5rem] items-start gap-3 rounded-2xl px-3 py-3 text-left transition lg:min-w-0 lg:rounded-none lg:px-0 lg:py-0 ${
                  active ? 'bg-white/10 lg:bg-transparent' : 'hover:bg-white/5 lg:hover:bg-transparent'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                      active
                        ? 'border-accent bg-accent text-white'
                        : done
                          ? 'border-[#22c55e] bg-[#22c55e] text-white'
                          : 'border-white/25 bg-white/5 text-white/50'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" strokeWidth={3} /> : s.id}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span
                      className={`mt-1 hidden w-px flex-1 lg:block ${
                        done ? 'bg-[#22c55e]/70' : 'bg-white/15'
                      }`}
                      style={{ minHeight: '2.25rem' }}
                    />
                  )}
                </div>
                <div className="min-w-0 pt-1.5 lg:pb-6">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${
                        active ? 'text-accent' : 'text-white/35'
                      }`}
                    />
                    <p
                      className={`truncate text-sm font-semibold sm:text-base ${
                        active ? 'text-white' : 'text-white/55'
                      }`}
                    >
                      {s.label}
                    </p>
                  </div>
                  <p className="mt-1 hidden text-xs leading-snug text-white/40 sm:text-sm lg:block">
                    {s.description}
                  </p>
                </div>
              </button>
            )
          })}
        </nav>

        <div className="relative mt-6 hidden border-t border-white/10 pt-5 lg:block">
          <p className="text-xs text-white/45 sm:text-sm">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-accent hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </aside>

      {/* Right workspace */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f6f7f9]">
        <header className="flex items-center justify-between gap-4 border-b border-[#e5e7eb] bg-white px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent sm:text-sm">
              Step {step} of {STEPS.length}
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-ink sm:text-xl lg:text-2xl">
              {current.label}
            </h2>
          </div>
          <div className="hidden h-2 w-36 overflow-hidden rounded-full bg-[#e5e7eb] sm:block">
            <div
              className="h-full rounded-full bg-gradient-to-r from-navy to-accent transition-all duration-300"
              style={{ width: `${(step / STEPS.length) * 100}%` }}
            />
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          <p className="mb-5 max-w-2xl shrink-0 text-sm text-[#6b7280] sm:text-base">
            {current.description}
          </p>

          <div className="min-h-0 flex-1">
            {step === 1 && (
              <SiteInformationStep
                address={address}
                mapPosition={mapPosition}
                onMapPosition={setMapPosition}
                onAddress={setAddress}
                selectedPpe={selectedPpe}
                onTogglePpe={togglePpe}
              />
            )}
            {step === 2 && (
              <CredentialsStep
                name={name}
                email={email}
                projectName={projectName}
                projectId={projectId}
                password={password}
                showPassword={showPassword}
                onName={setName}
                onEmail={setEmail}
                onProjectName={setProjectName}
                onRegenId={() => setProjectId(makeProjectId())}
                onPassword={setPassword}
                onTogglePassword={() => setShowPassword((v) => !v)}
              />
            )}
            {step === 3 && (
              <CameraDevicePicker
                selectedDeviceId={selectedCameraId}
                onSelect={(deviceId, label) => {
                  setSelectedCameraId(deviceId)
                  setSelectedCameraLabel(label)
                }}
              />
            )}
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-[#e5e7eb] bg-white px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={step === 1}
            className="inline-flex h-11 items-center gap-1 rounded-full border border-[#d8dce3] px-4 text-sm font-semibold text-ink transition hover:border-navy disabled:cursor-not-allowed disabled:opacity-35 sm:text-base"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            Back
          </button>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-[#6b7280] hover:text-navy hover:underline lg:hidden"
            >
              Log in
            </Link>
            <button
              type="button"
              onClick={() => go(1)}
              className="inline-flex h-11 items-center gap-1 rounded-full bg-navy px-6 text-sm font-semibold text-white transition hover:bg-[#24314d] sm:text-base"
            >
              {step === STEPS.length ? 'Finish setup' : 'Continue'}
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}

function SiteInformationStep({
  address,
  mapPosition,
  onMapPosition,
  onAddress,
  selectedPpe,
  onTogglePpe,
}: {
  address: string
  mapPosition: LatLng
  onMapPosition: (pos: LatLng) => void
  onAddress: (address: string) => void
  selectedPpe: string[]
  onTogglePpe: (id: string) => void
}) {
  return (
    <div className="grid h-full min-h-[520px] grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-5">
      {/* Map column — search above + pure map */}
      <div className="min-h-[420px] lg:col-span-3 lg:min-h-0">
        <SiteMapPicker
          position={mapPosition}
          address={address}
          onPositionChange={onMapPosition}
          onAddressChange={onAddress}
          className="h-full min-h-[420px] lg:min-h-0"
        />
      </div>

      {/* Side card — address + PPE icons */}
      <div className="flex flex-col gap-5 rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm lg:col-span-1 lg:self-stretch">
        <div>
          <h3 className="text-base font-bold text-ink sm:text-lg">Address</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#4b5563] sm:text-base">
            {address}
          </p>
        </div>

        <div className="h-px bg-[#e5e7eb]" />

        <div className="min-h-0 flex-1">
          <h3 className="mb-3 text-base font-bold text-ink sm:text-lg">Required PPE</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {PPE_OPTIONS.map((item) => {
              const selected = selectedPpe.includes(item.id)
              const Icon = PPE_ICON_MAP[item.icon]
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTogglePpe(item.id)}
                  className={`flex min-h-[52px] items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition sm:text-base ${
                    selected
                      ? 'border border-[#f0b27a] bg-[#fce8d5] text-[#c2410c]'
                      : 'border border-[#e5e7eb] bg-[#f8f9fb] text-[#4b5563] hover:border-[#d1d5db]'
                  }`}
                >
                  <Icon selected={selected} className="h-7 w-7 shrink-0" />
                  <span className="leading-tight">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function CredentialsStep({
  name,
  email,
  projectName,
  projectId,
  password,
  showPassword,
  onName,
  onEmail,
  onProjectName,
  onRegenId,
  onPassword,
  onTogglePassword,
}: {
  name: string
  email: string
  projectName: string
  projectId: string
  password: string
  showPassword: boolean
  onName: (v: string) => void
  onEmail: (v: string) => void
  onProjectName: (v: string) => void
  onRegenId: () => void
  onPassword: (v: string) => void
  onTogglePassword: () => void
}) {
  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="Full name"
            className={inputClass}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Project name">
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectName(e.target.value)}
            placeholder="e.g. Riverside Monitoring"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field
          label={
            <>
              Project ID{' '}
              <span className="font-normal text-[#9ca3af]">- generated</span>
            </>
          }
        >
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={projectId}
              className={`${inputClass} font-mono text-sm text-[#6b7280]`}
            />
            <button
              type="button"
              onClick={onRegenId}
              title="Regenerate"
              className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-[#d8dce3] bg-white text-[#6b7280] transition hover:border-accent hover:text-accent"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Password">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-0 top-0 flex h-[42px] w-[42px] items-center justify-center text-[#6b7280]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </Field>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: ReactNode
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink sm:text-base">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'h-11 w-full rounded-lg border border-[#d8dce3] bg-white px-3 text-sm text-ink outline-none transition placeholder:text-[#9ca3af] focus:border-accent focus:shadow-[0_0_0_3px_#fdf1e7] sm:text-base'
