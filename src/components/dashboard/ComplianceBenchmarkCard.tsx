import { Gauge } from 'lucide-react'
import { complianceBenchmark } from '@/data/mock'

export function ComplianceBenchmarkCard() {
  const {
    highCompliance,
    modelAccuracy,
    ppeDetection,
    compliant,
    nonCompliant,
    needsChecking,
  } = complianceBenchmark

  const radius = 48
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - highCompliance / 100)

  return (
    <section className="flex w-full flex-col border-t border-gray-200 bg-white p-4">
      <h2 className="flex items-center gap-2 text-[16px] font-bold text-ink">
        <span className="inline-flex h-8 w-8 rounded-md items-center justify-center bg-[#dcfce7] text-[#16a34a]">
          <Gauge className="h-4 w-4" strokeWidth={2.25} />
        </span>
        Compliance benchmark
      </h2>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex shrink-0 items-center gap-4">
          <div className="relative h-[100px] w-[100px] sm:h-[112px] sm:w-[112px]">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#e8eaed"
                strokeWidth="11"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#4ade80"
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[26px] font-bold leading-none text-[#22c55e] sm:text-[28px]">
                {highCompliance}%
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-tight text-[#22c55e]">
              High Compliance
            </p>
            <div className="mt-2 space-y-0.5 text-[12px] text-muted">
              <p>
                Model Accuracy{' '}
                <span className="font-semibold text-ink">{modelAccuracy}%</span>
              </p>
              <p>
                PPE Detection{' '}
                <span className="font-semibold text-ink">{ppeDetection}%</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 flex-1 rounded-lg grid-cols-3 divide-x divide-gray-200 border border-gray-200">
          <StatusPill label="Compliant" value={compliant} color="#22c55e" />
          <StatusPill
            label="Non-compliant"
            value={nonCompliant}
            color="#f87171"
          />
          <StatusPill
            label="Needs checking"
            value={needsChecking}
            color="#fb923c"
          />
        </div>
      </div>
    </section>
  )
}

function StatusPill({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-50/80 px-2 py-3 text-center sm:py-4">
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {value}
      </span>
      <span
        className="mt-2 text-[11px] font-semibold leading-tight sm:text-xs"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  )
}
