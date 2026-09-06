import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { recentAnalyses } from '@/data/mock'

export function RecentAnalyses() {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Recent Analyses</h2>
        <Link
          to="/records"
          className="text-sm font-semibold text-accent hover:underline"
        >
          See all
        </Link>
      </div>
      <ul className="space-y-4">
        {recentAnalyses.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  item.status === 'flagged' ? 'bg-alert' : 'bg-brand'
                }`}
              />
              <p className="text-sm text-gray-700">{item.timestamp}</p>
            </div>
            <Badge tone={item.status === 'flagged' ? 'red' : 'green'}>
              {item.status === 'flagged'
                ? `${item.flaggedCount} flagged`
                : 'Clear'}
            </Badge>
          </li>
        ))}
      </ul>
    </article>
  )
}
