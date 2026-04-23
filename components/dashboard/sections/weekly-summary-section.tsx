'use client'

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EmptyState, SectionCard } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
import { useMealsQuery } from '@/lib/hooks/use-dashboard-api'

function getWeekStart(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  next.setDate(next.getDate() - next.getDay())
  return next
}

function getWeekEnd(date: Date) {
  const next = getWeekStart(date)
  next.setDate(next.getDate() + 6)
  next.setHours(23, 59, 59, 999)
  return next
}

export function WeeklySummarySection() {
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const dateFrom = getWeekStart(anchorDate).toISOString()
  const dateTo = getWeekEnd(anchorDate).toISOString()
  const mealsQuery = useMealsQuery({ limit: 300, dateFrom, dateTo })

  const summary = useMemo(() => {
    const dayMap = new Map<string, { label: string; calories: number; meals: number }>()
    const start = getWeekStart(anchorDate)

    for (let offset = 0; offset < 7; offset += 1) {
      const current = new Date(start)
      current.setDate(start.getDate() + offset)
      const key = current.toISOString().slice(0, 10)
      dayMap.set(key, {
        label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(current),
        calories: 0,
        meals: 0,
      })
    }

    for (const meal of mealsQuery.data?.meals ?? []) {
      const key = meal.loggedAt.slice(0, 10)
      const entry = dayMap.get(key)

      if (!entry) {
        continue
      }

      entry.calories += meal.items.reduce((sum, item) => sum + item.calories, 0)
      entry.meals += 1
    }

    const days = Array.from(dayMap.values())
    const totalCalories = days.reduce((sum, day) => sum + day.calories, 0)
    const totalMeals = days.reduce((sum, day) => sum + day.meals, 0)

    return {
      days,
      totalCalories,
      totalMeals,
      averageCalories: Math.round(totalCalories / 7),
    }
  }, [anchorDate, mealsQuery.data?.meals])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-[#f5f5f5]">
            Week of{' '}
            {new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }).format(getWeekStart(anchorDate))}
          </h2>
          <p className="mt-1 text-sm text-[#777]">Your weekly nutrition summary</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAnchorDate((value) => new Date(value.getFullYear(), value.getMonth(), value.getDate() - 7))}
            className="rounded-full border border-white/10 bg-[#141414] p-2 text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setAnchorDate((value) => new Date(value.getFullYear(), value.getMonth(), value.getDate() + 7))}
            className="rounded-full border border-white/10 bg-[#141414] p-2 text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {mealsQuery.isLoading ? (
        <SectionCard className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
        </SectionCard>
      ) : summary.totalMeals === 0 ? (
        <SectionCard>
          <EmptyState
            title="No meals logged in this week"
            description="As your history grows, this view will show weekly calorie totals and consistency across the week."
          />
        </SectionCard>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SectionCard className="p-4 sm:p-6">
              <div className="text-xs uppercase tracking-wider text-[#666]">Weekly calories</div>
              <div className="mt-2 font-mono text-2xl text-[#f5f5f5] sm:text-3xl">{summary.totalCalories}</div>
            </SectionCard>
            <SectionCard className="p-4 sm:p-6">
              <div className="text-xs uppercase tracking-wider text-[#666]">Average per day</div>
              <div className="mt-2 font-mono text-2xl text-[#f5f5f5] sm:text-3xl">{summary.averageCalories}</div>
            </SectionCard>
            <SectionCard className="p-4 sm:p-6">
              <div className="text-xs uppercase tracking-wider text-[#666]">Meals logged</div>
              <div className="mt-2 font-mono text-2xl text-[#f5f5f5] sm:text-3xl">{summary.totalMeals}</div>
            </SectionCard>
          </div>

          <SectionCard>
            <div className="mb-5">
              <h3 className="text-lg text-[#f5f5f5]">Daily calories</h3>
              <p className="mt-1 text-sm text-[#777]">
                Your logged calories across the week.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] p-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary.days.map((day) => ({
                      label: day.label,
                      calories: day.calories,
                      meals: day.meals,
                    }))}
                    margin={{ top: 12, right: 8, left: -20, bottom: 4 }}
                  >
                    <CartesianGrid
                      stroke="#242424"
                      strokeDasharray="4 8"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#777', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#777', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={42}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      formatter={(value, name, item) => {
                        if (name === 'calories') {
                          return [`${value} cal`, 'Calories']
                        }

                        return [`${item.payload.meals} meals`, 'Meals']
                      }}
                      contentStyle={{
                        backgroundColor: '#101010',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        color: '#f5f5f5',
                      }}
                      labelStyle={{ color: '#f5f5f5', fontWeight: 600 }}
                    />
                    <Bar
                      dataKey="calories"
                      fill="#e4ff00"
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}
