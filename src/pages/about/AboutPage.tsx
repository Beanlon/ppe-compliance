import {
  Camera,
  ClipboardList,
  Gauge,
  HardHat,
  MapPinned,
  ShieldCheck,
  Video,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Reveal } from './components/Reveal'

const features = [
  {
    icon: Video,
    title: 'Live site monitoring',
    description:
      'Watch active camera feeds from the worksite so officers can spot PPE gaps as work happens.',
    tone: 'navy' as const,
  },
  {
    icon: ShieldCheck,
    title: 'AI PPE detection',
    description:
      'Computer vision flags missing or incomplete gear—helmets, vests, shoes, gloves, and harnesses.',
    tone: 'green' as const,
  },
  {
    icon: Gauge,
    title: 'Compliance benchmarks',
    description:
      'Track high-level compliance, model accuracy, and detection rates in one clear dashboard view.',
    tone: 'orange' as const,
  },
  {
    icon: ClipboardList,
    title: 'Snapshot records',
    description:
      'Review dated snapshots of compliant and non-compliant moments for audits and follow-ups.',
    tone: 'green' as const,
  },
  {
    icon: HardHat,
    title: 'Required PPE setup',
    description:
      'Define which gear is mandatory for each project so detection stays aligned with site rules.',
    tone: 'orange' as const,
  },
  {
    icon: MapPinned,
    title: 'Site-aware projects',
    description:
      'Pin project locations, assign cameras, and keep every worksite’s safety context in one place.',
    tone: 'navy' as const,
  },
]

const toneStyles = {
  navy: {
    card: 'border-navy/15 bg-white',
    icon: 'bg-navy text-white',
  },
  green: {
    card: 'border-[#bbf7d0] bg-[#f0fdf4]',
    icon: 'bg-[#16a34a] text-white',
  },
  orange: {
    card: 'border-[#fed7aa] bg-[#fff7ed]',
    icon: 'bg-accent text-white',
  },
}

const creators = [
  {
    name: 'Jeric B. Mata',
    role: 'System Analyst & Frontend Developer',
    image: '/brand/about/creator-jeric.jpg',
    accent: '#2e3a59',
  },
  {
    name: 'Seth Leyson',
    role: 'Backend Lead',
    image: '/brand/about/creator-seth.jpg',
    accent: '#ff6a1a',
  },
  {
    name: 'Vin Benjamin J. Belandres',
    role: 'AI & Detection Engineer',
    image: '/brand/about/creator-vin.jpg',
    accent: '#16a34a',
  },
]

const highlights = [
  { label: 'Live feeds', value: 'Real-time', color: 'text-[#4ade80]' },
  { label: 'PPE checks', value: 'AI-assisted', color: 'text-[#fdba74]' },
  { label: 'Records', value: 'Audit-ready', color: 'text-white' },
]

export function AboutPage() {
  return (
    <div className="w-full pb-6">
      <Reveal>
        <PageHeader
          title="About us"
          subtitle="AI-assisted PPE compliance monitoring for construction worksites."
        />
      </Reveal>

      {/* Hero — navy + photo contrast */}
      <Reveal className="mt-0" delayMs={60}>
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-2">
            <div className="relative flex flex-col justify-center bg-navy px-6 py-8 text-white sm:px-8 sm:py-10 lg:px-10 lg:py-12">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-2xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-[#4ade80]/15 blur-2xl"
                aria-hidden
              />

              <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-[#fdba74]">
                What GearSight is
              </p>
              <h2 className="relative mt-3 max-w-[18ch] font-display text-3xl font-bold uppercase leading-[1.05] tracking-wide sm:text-4xl">
                Making PPE compliance visible & actionable
              </h2>
              <p className="relative mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
                GearSight helps safety officers review live site footage and
                recorded snapshots. AI highlights likely PPE issues so teams can
                respond faster—while officers remain responsible for final
                verification.
              </p>

              <div className="relative mt-8 grid grid-cols-3 gap-3 border-t border-white/15 pt-6">
                {highlights.map((item, i) => (
                  <Reveal key={item.label} delayMs={120 + i * 80}>
                    <div>
                      <p className={`text-sm font-bold sm:text-base ${item.color}`}>
                        {item.value}
                      </p>
                      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-white/45 sm:text-xs">
                        {item.label}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal variant="fade-in" delayMs={140} className="h-full min-h-[220px] sm:min-h-[280px]">
              <div className="relative h-full min-h-[220px] sm:min-h-[280px] lg:min-h-full">
                <img
                  src="/brand/about/hero.jpg"
                  alt="Construction crew in PPE working on a concrete pour"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-navy/25" />
                <Reveal
                  variant="scale-in"
                  delayMs={280}
                  className="absolute bottom-4 left-4 right-4 z-10 sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-xs"
                >
                  <div className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur-sm">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#dcfce7] text-[#16a34a]">
                      <Camera className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-ink">
                        Worksite-ready monitoring
                      </p>
                      <p className="text-[11px] text-muted">
                        Built for officers on active sites
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>
            </Reveal>
          </div>
        </section>
      </Reveal>

      {/* Features */}
      <section className="mt-8 sm:mt-10">
        <Reveal>
          <div className="mb-5 max-w-xl lg:mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
              Features
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-ink sm:text-2xl">
              What you can do with GearSight
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">
              From live monitoring to historical records, every tool helps
              officers keep PPE standards consistent across the site.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon
            const styles = toneStyles[feature.tone]
            return (
              <Reveal key={feature.title} delayMs={i * 70}>
                <article
                  className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${styles.card}`}
                >
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${styles.icon}`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <h3 className="mt-3 text-base font-bold text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Creators */}
      <Reveal className="mt-8 sm:mt-10">
        <section className="overflow-hidden rounded-2xl bg-navy">
          <div className="border-b border-white/10 px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#fdba74]">
                  The team
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Meet the creators
                </h2>
                <p className="mt-2 max-w-xl text-sm text-white/65 sm:text-base">
                  A small team focused on practical worksite safety—design,
                  engineering, and detection working as one.
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#4ade80]">
                GearSight · Founding team
              </p>
            </div>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-6 lg:grid-cols-3 lg:p-8">
            {creators.map((creator, i) => (
              <Reveal key={creator.name} variant="scale-in" delayMs={100 + i * 90}>
                <article className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-navy shadow-lg shadow-black/30">
                  <img
                    src={creator.image}
                    alt={`Portrait of ${creator.name}`}
                    className="absolute inset-0 h-full w-full scale-[1.04] object-cover object-center"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
                    aria-hidden
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <div
                      className="mb-2.5 h-1 w-10 rounded-full"
                      style={{ backgroundColor: creator.accent }}
                      aria-hidden
                    />
                    <h3 className="text-base font-bold leading-tight text-white sm:text-lg">
                      {creator.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-white/80">
                      {creator.role}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  )
}
