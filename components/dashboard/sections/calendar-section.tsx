'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { calendarData } from '@/components/dashboard/data'
import { SectionCard, cn } from '@/components/dashboard/ui'

export function CalendarSection() {
  const [selectedDay, setSelectedDay] = useState(19)
  const selectedData = calendarData[selectedDay]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDayTone = (day: number) => {
    const data = calendarData[day]
    if (!data) return 'border-white/5 bg-[#0a0a0a]'
    const percentage = (data.calories / data.goal) * 100
    if (percentage <= 100) return 'border-[#4ade80]/30 bg-[#4ade80]/10'
    if (percentage <= 110) return 'border-amber-400/30 bg-amber-400/10'
    return 'border-red-400/30 bg-red-400/10'
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-[#f5f5f5]">April 2026</h2>
        <div className="flex gap-2">
          <button className="rounded-full border border-white/10 bg-[#141414] p-2 text-[#888] transition-colors hover:border-[#4ade80]/50 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="rounded-full border border-white/10 bg-[#141414] p-2 text-[#888] transition-colors hover:border-[#4ade80]/50 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {dayNames.map((day) => (
          <div key={day} className="py-2 text-center text-sm text-[#666]">
            {day}
          </div>
        ))}
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {Array.from({ length: 30 }, (_, index) => index + 1).map((day) => {
          const data = calendarData[day]
          const isSelected = day === selectedDay
          const isToday = day === 19

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'aspect-square rounded-2xl border p-3 text-left transition-all hover:border-[#4ade80]/50',
                getDayTone(day),
                isSelected && 'ring-2 ring-[#4ade80]',
                isToday && 'border-[#4ade80]',
              )}
            >
              <div className="flex h-full flex-col justify-between">
                <span className="text-sm text-[#f5f5f5]">{day}</span>
                {data ? <span className="font-mono text-xs text-[#4ade80]">{data.calories}</span> : null}
              </div>
            </button>
          )
        })}
      </div>

      {selectedData ? (
        <SectionCard>
          <h3 className="mb-5 text-xl text-[#f5f5f5]">April {selectedDay}, 2026</h3>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div>
              <div className="mb-1 text-sm text-[#777]">Total Calories</div>
              <div className="font-mono text-3xl text-[#4ade80]">{selectedData.calories}</div>
            </div>
            <div>
              <div className="mb-1 text-sm text-[#777]">Goal</div>
              <div className="font-mono text-3xl text-[#aaa]">{selectedData.goal}</div>
            </div>
            <div>
              <div className="mb-1 text-sm text-[#777]">Meals Logged</div>
              <div className="font-mono text-3xl text-[#aaa]">{selectedData.meals}</div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              ['Protein', '120g', '80%', '#4ade80'],
              ['Carbs', '180g', '90%', '#22c55e'],
              ['Fat', '55g', '82%', '#888888'],
            ].map(([name, value, width, color]) => (
              <div
                key={name}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 md:flex-row md:items-center md:justify-between"
              >
                <span className="text-[#f5f5f5]">{name}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width, backgroundColor: color }} />
                  </div>
                  <span className="font-mono text-[#888]">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  )
}
