'use client'

import { useMemo, useState } from 'react'
import { Edit2, Filter, Search, Trash2 } from 'lucide-react'

import { mealsData } from '@/components/dashboard/data'
import { SectionCard, cn } from '@/components/dashboard/ui'

export function MealsSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const filteredMeals = useMemo(
    () => mealsData.filter((meal) => meal.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery],
  )

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
            className="w-full rounded-2xl border border-white/10 bg-[#141414] py-3 pl-11 pr-4 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#4ade80]"
          />
        </div>
        <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 text-[#888] transition-colors hover:border-[#4ade80]/50 hover:text-[#f5f5f5]">
          <Filter className="h-4 w-4" />
          Filters
        </button>
        <input
          type="date"
          defaultValue="2026-04-19"
          className="rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 font-mono text-[#888] outline-none focus:border-[#4ade80]"
        />
      </div>

      <SectionCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-left text-[#666]">
                {['Food', 'Meal', 'Time', 'Calories', 'Protein', 'Carbs', 'Fat', 'Source', 'Actions'].map(
                  (heading, index) => (
                    <th key={heading} className={cn('px-6 py-4 font-medium', index >= 3 ? 'text-right' : '')}>
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filteredMeals.map((meal) => (
                <tr key={meal.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4 text-[#f5f5f5]">{meal.name}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full border border-white/10 bg-[#0a0a0a] px-2 py-1 text-xs text-[#888]">
                      {meal.meal}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#777]">{meal.time}</td>
                  <td className="px-6 py-4 text-right font-mono text-[#4ade80]">{meal.calories}</td>
                  <td className="px-6 py-4 text-right font-mono text-[#888]">{meal.protein}g</td>
                  <td className="px-6 py-4 text-right font-mono text-[#888]">{meal.carbs}g</td>
                  <td className="px-6 py-4 text-right font-mono text-[#888]">{meal.fat}g</td>
                  <td className="px-6 py-4 text-center">
                    <span className="rounded-full border border-white/10 bg-[#0a0a0a] px-2 py-1 text-xs text-[#888]">
                      {meal.source}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="rounded-full p-2 text-[#888] transition-colors hover:bg-white/5 hover:text-white">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="rounded-full p-2 text-[#888] transition-colors hover:bg-white/5 hover:text-white">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
