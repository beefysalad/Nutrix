import { ChevronLeft, ChevronRight } from 'lucide-react'

import { EmptyState, SectionCard } from '@/components/dashboard/ui'

export function WeeklySummarySection() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-[#f5f5f5]">Week of April 13 - 19, 2026</h2>
          <p className="mt-1 text-sm text-[#777]">Your weekly nutrition summary</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full border border-white/10 bg-[#141414] p-2 text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="rounded-full border border-white/10 bg-[#141414] p-2 text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <SectionCard>
        <EmptyState
          title="Weekly summaries are not computed yet"
          description="The mock weekly stats and status table have been removed. This screen should read from meal history plus the active goal once those queries exist."
        />
      </SectionCard>
    </div>
  )
}
