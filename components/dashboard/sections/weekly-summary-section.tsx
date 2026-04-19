import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react'

import { weekData, weekStats } from '@/components/dashboard/data'
import { SectionCard, cn } from '@/components/dashboard/ui'

export function WeeklySummarySection() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-[#f5f5f5]">Week of April 13 - 19, 2026</h2>
          <p className="mt-1 text-sm text-[#777]">Your weekly nutrition summary</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full border border-white/10 bg-[#141414] p-2 text-[#888] transition-colors hover:border-[#4ade80]/50 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="rounded-full border border-white/10 bg-[#141414] p-2 text-[#888] transition-colors hover:border-[#4ade80]/50 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {weekStats.map((stat) => {
          const delta = stat.thisWeek - stat.lastWeek
          const isPositive = delta > 0

          return (
            <SectionCard key={stat.label}>
              <div className="mb-2 text-sm text-[#777]">{stat.label}</div>
              <div className="mb-1 font-mono text-3xl text-[#4ade80]">
                {stat.thisWeek}
                {stat.unit ? <span className="ml-1 text-sm text-[#666]">{stat.unit}</span> : null}
              </div>
              <div className="text-xs text-[#888]">
                vs last week:{' '}
                <span className={isPositive ? 'text-[#4ade80]' : 'text-red-400'}>
                  {isPositive ? '+' : ''}
                  {((delta / stat.lastWeek) * 100).toFixed(1)}%
                </span>
              </div>
            </SectionCard>
          )
        })}
      </div>

      <SectionCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-left text-[#666]">
                {['Day', 'Date', 'Calories', 'Goal', 'On Target'].map((heading, index) => (
                  <th key={heading} className={cn('px-6 py-4 font-medium', index >= 2 ? 'text-right' : '')}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekData.map((day) => (
                <tr key={day.date} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-6 py-4 text-[#f5f5f5]">{day.day}</td>
                  <td className="px-6 py-4 text-[#888]">{day.date}</td>
                  <td className="px-6 py-4 text-right font-mono text-[#4ade80]">{day.calories}</td>
                  <td className="px-6 py-4 text-right font-mono text-[#888]">{day.goal}</td>
                  <td className="px-6 py-4 text-right">
                    {day.onTarget ? (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#4ade80]/10 p-1.5">
                        <Check className="h-4 w-4 text-[#4ade80]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-full bg-red-400/10 p-1.5">
                        <X className="h-4 w-4 text-red-400" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}
