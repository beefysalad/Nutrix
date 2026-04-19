'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { EmptyState, SectionCard } from '@/components/dashboard/ui'

export function CalendarSection() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-[#f5f5f5]">April 2026</h2>
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
          title="Calendar history is empty"
          description="There are no fake daily calorie blocks anymore. This view should eventually aggregate MealEntry records by day and compare them against the active Goal."
        />
      </SectionCard>
    </div>
  )
}
