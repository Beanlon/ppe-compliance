import { PageHeader } from '@/components/layout/PageHeader'

export function AboutPage() {
  return (
    <div className="w-full">
      <PageHeader
        title="About us"
        subtitle="AI-assisted PPE compliance monitoring for construction worksites."
      />

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-sm leading-relaxed text-gray-700">
          GearSight helps safety officers review live site footage and recorded
          snapshots. The AI flags likely PPE issues; officers remain responsible
          for final verification and safety decisions.
        </p>
      </section>
    </div>
  )
}
