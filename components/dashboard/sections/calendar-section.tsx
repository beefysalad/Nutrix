'use client'

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { EmptyState, SectionCard, cn } from '@/components/dashboard/ui'
import { useMealsQuery } from '@/lib/hooks/use-dashboard-api'

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function CalendarSection() {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date())
  const dateFrom = startOfMonth(visibleMonth).toISOString()
  const dateTo = endOfMonth(visibleMonth).toISOString()
  const mealsQuery = useMealsQuery({ limit: 500, dateFrom, dateTo })

  const days = useMemo(() => {
    const totals = new Map<string, { calories: number; meals: number }>()

    for (const meal of mealsQuery.data?.meals ?? []) {
      const key = meal.loggedAt.slice(0, 10)
      const existing = totals.get(key) ?? { calories: 0, meals: 0 }
      existing.calories += meal.items.reduce((sum, item) => sum + item.calories, 0)
      existing.meals += 1
      totals.set(key, existing)
    }

    const monthStart = startOfMonth(visibleMonth)
    const monthEnd = endOfMonth(visibleMonth)
    const leading = monthStart.getDay()
    const totalDays = monthEnd.getDate()
    const cells: Array<{ key: string; label: string; calories: number; meals: number; inMonth: boolean }> = []

    for (let index = 0; index < leading; index += 1) {
      cells.push({ key: `leading-${index}`, label: '', calories: 0, meals: 0, inMonth: false })
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const key = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)
        .toISOString()
        .slice(0, 10)
      const totalsForDay = totals.get(key)

      cells.push({
        key,
        label: String(day),
        calories: totalsForDay?.calories ?? 0,
        meals: totalsForDay?.meals ?? 0,
        inMonth: true,
      })
    }

    return cells
  }, [mealsQuery.data?.meals, visibleMonth])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-[#f5f5f5]">
          {new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric',
          }).format(visibleMonth)}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setVisibleMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))}
            className="rounded-full border border-white/10 bg-[#141414] p-2 text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setVisibleMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))}
            className="rounded-full border border-white/10 bg-[#141414] p-2 text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <SectionCard>
        {mealsQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
          </div>
        ) : days.every((day) => !day.meals) ? (
          <EmptyState
            title="No meals logged in this month"
            description="As you log food, each day will show meal count and total calories right in the calendar."
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] font-bold uppercase tracking-widest text-[#555]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                <div key={label} className="py-2">{label}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {days.map((day) => {
                const isToday = day.inMonth && day.key === new Date().toISOString().slice(0, 10)
                
                return (
                  <div
                    key={day.key}
                    className={cn(
                      'relative flex flex-col items-center justify-start rounded-xl border p-1 transition-all sm:p-3 aspect-[4/5] sm:aspect-auto sm:min-h-28',
                      day.inMonth
                        ? day.meals
                          ? 'border-[#e4ff00]/40 bg-[#e4ff00]/5 shadow-[inset_0_0_12px_rgba(228,255,0,0.03)]'
                          : 'border-white/5 bg-[#0a0a0a] hover:border-white/10'
                        : 'border-transparent bg-transparent opacity-0',
                      isToday && 'border-[#e4ff00] ring-1 ring-[#e4ff00]/20'
                    )}
                  >
                    {day.inMonth ? (
                      <>
                        <div className={cn(
                          "text-[11px] sm:text-sm font-medium transition-colors",
                          day.meals > 0 ? "text-white" : "text-[#444]",
                          isToday && "text-[#e4ff00]"
                        )}>
                          {day.label}
                        </div>
                        
                        {day.meals > 0 ? (
                          <div className="mt-auto flex flex-col items-center gap-1 pb-1">
                            <div className="hidden sm:block text-[10px] text-[#777]">
                              {day.meals} {day.meals === 1 ? 'meal' : 'meals'}
                            </div>
                            <div className="font-mono text-[9px] sm:text-xs font-bold text-[#e4ff00]">
                              {day.calories}<span className="hidden sm:inline ml-0.5 opacity-60">cal</span>
                            </div>
                            <div className="h-1 w-1 rounded-full bg-[#e4ff00] sm:hidden" />
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
