import { Badge } from '@/components/ui/Badge'
import type { SnapshotRecord } from '@/types'

interface RecordsTableProps {
  rows: SnapshotRecord[]
}

export function RecordsTable({ rows }: RecordsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#14161f] text-white">
            <tr>
              <th className="px-5 py-4 font-semibold">No.</th>
              <th className="px-5 py-4 font-semibold">Preview</th>
              <th className="px-5 py-4 font-semibold">Snapshot ID</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Time</th>
              <th className="px-5 py-4 font-semibold">No. of Violations</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-[#f3f4f6]'}
              >
                <td className="px-5 py-3.5 font-medium text-gray-800">
                  {String(index + 1).padStart(2, '0')}
                </td>
                <td className="px-5 py-3.5">
                  <img
                    src={row.previewUrl}
                    alt=""
                    className="h-10 w-14 rounded-lg object-cover"
                  />
                </td>
                <td className="px-5 py-3.5 font-medium text-gray-800">
                  {row.snapshotId}
                </td>
                <td className="px-5 py-3.5 text-gray-700">{row.date}</td>
                <td className="px-5 py-3.5 text-gray-700">{row.time}</td>
                <td className="px-5 py-3.5">
                  {row.violationCount === 0 ? (
                    <Badge tone="green">None</Badge>
                  ) : (
                    <Badge tone="red">{row.violationCount} violations</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
