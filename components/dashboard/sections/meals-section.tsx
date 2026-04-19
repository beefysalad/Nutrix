'use client'

import { useState } from 'react'
import { Filter, Search } from 'lucide-react'

import { EmptyState, SectionCard } from '@/components/dashboard/ui'

export function MealsSection() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search meals..."
            className="w-full rounded-2xl border border-white/10 bg-[#141414] py-3 pl-11 pr-4 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
          />
        </div>
        <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]">
          <Filter className="h-4 w-4" />
          Filters
        </button>
        <input
          type="date"
          defaultValue="2026-04-19"
          className="rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 font-mono text-[#888] outline-none focus:border-[#e4ff00]"
        />
      </div>

      <SectionCard className="overflow-hidden p-0">
        <div className="p-6">
          <EmptyState
            title="No meal entries yet"
            description="The fake meal history has been removed. This table should render real MealEntry and MealItem records once we add queries and mutations."
          />
        </div>
      </SectionCard>
    </div>
  )
}
