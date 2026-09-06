import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { workers } from '@/data/mock'

export function WorkersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950">
            Worker Database
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Register workers and review compliance history.
          </p>
        </div>
        <Button>+ Register Worker</Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#14161f] text-white">
            <tr>
              <th className="px-5 py-4 font-semibold">Employee ID</th>
              <th className="px-5 py-4 font-semibold">Name</th>
              <th className="px-5 py-4 font-semibold">Trade</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Violations</th>
              <th className="px-5 py-4 font-semibold">Profile</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker, index) => (
              <tr
                key={worker.id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-[#f3f4f6]'}
              >
                <td className="px-5 py-3.5 font-medium">{worker.employeeId}</td>
                <td className="px-5 py-3.5">{worker.name}</td>
                <td className="px-5 py-3.5">{worker.trade}</td>
                <td className="px-5 py-3.5">
                  <Badge tone={worker.status === 'active' ? 'green' : 'gray'}>
                    {worker.status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  <Badge tone={worker.violationCount ? 'red' : 'green'}>
                    {worker.violationCount || 'None'}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  <Link
                    to={`/workers/${worker.id}`}
                    className="font-semibold text-accent hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
