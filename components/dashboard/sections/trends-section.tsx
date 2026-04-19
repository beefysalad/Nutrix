'use client'

import { useState } from 'react'

import { SectionCard, EmptyState, cn } from '@/components/dashboard/ui'

export function TrendsSection() {
  const [selectedRange, setSelectedRange] = useState('7 Days')

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-2xl text-[#f5f5f5]">Nutrition Trends</h2>
        <div className="flex gap-2">
          {['7 Days', '30 Days', '90 Days'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm transition-colors',
                selectedRange === range
                  ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                  : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]',
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <SectionCard>
        <EmptyState
          title="Trends will appear after meals are logged"
          description="The fake line and bar charts have been removed. Once meal and goal data exists, this section can compute real daily calories, macro splits, and meal distribution."
        />
      </SectionCard>
    </div>
  )
}
