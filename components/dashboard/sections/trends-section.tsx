'use client'

import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EmptyState, SectionCard } from '@/components/dashboard/ui'
import { useDashboardTrendsQuery } from '@/hooks/dashboard'

export function TrendsSection() {
  const trendsQuery = useDashboardTrendsQuery()

  const trendData = useMemo(() => {
    const goalCalories = trendsQuery.data?.goalCalories ?? 0
    const values = trendsQuery.data?.points ?? []
    const sampled =
      values.length <= 14
        ? values
        : values.filter((_, index) => index % Math.ceil(values.length / 14) === 0)

    return {
      line: sampled.map((day) => ({
        label: day.label,
        calories: day.calories,
        goal: goalCalories,
      })),
      bars: sampled.map((day) => ({
        label: day.label,
        protein: day.protein,
        carbs: day.carbs,
        fat: day.fat,
      })),
    }
  }, [trendsQuery.data?.goalCalories, trendsQuery.data?.points])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl text-[#f5f5f5]">Nutrition Trends</h2>
          <span className="rounded-full bg-[#e4ff00] px-2 py-0.5 text-xs font-medium text-[#0a0a0a]">
            Beta
          </span>
        </div>
        <div className="rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/10 px-4 py-2 text-sm font-bold uppercase tracking-wide text-[#e4ff00]">
          Last 7 days
        </div>
      </div>

      {trendsQuery.isLoading ? (
        <SectionCard className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
        </SectionCard>
      ) : trendsQuery.isError ? (
        <SectionCard>
          <EmptyState
            title="Trends could not be loaded"
            description="Nutrix hit an issue while loading your nutrition trend data. Try again in a moment."
          />
        </SectionCard>
      ) : (
        <>
          <SectionCard>
            <div className="mb-5">
              <h3 className="text-lg text-[#f5f5f5]">Calories vs goal</h3>
              <p className="mt-1 text-sm text-[#777]">Your rolling calorie trend across the selected range.</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] p-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData.line} margin={{ top: 12, right: 8, left: -20, bottom: 4 }}>
                    <CartesianGrid stroke="#242424" strokeDasharray="4 8" vertical={false} />
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
                      contentStyle={{
                        backgroundColor: '#101010',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        color: '#f5f5f5',
                      }}
                      labelStyle={{ color: '#f5f5f5', fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ color: '#888', fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="goal"
                      name="Goal"
                      stroke="#767676"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="6 6"
                    />
                    <Line
                      type="monotone"
                      dataKey="calories"
                      name="Calories"
                      stroke="#e4ff00"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#e4ff00', stroke: '#e4ff00' }}
                      activeDot={{ r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="mb-5">
              <h3 className="text-lg text-[#f5f5f5]">Macro distribution</h3>
              <p className="mt-1 text-sm text-[#777]">Protein, carbs, and fat over time.</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] p-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData.bars} margin={{ top: 12, right: 8, left: -20, bottom: 4 }}>
                    <CartesianGrid stroke="#242424" strokeDasharray="4 8" vertical={false} />
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
                      contentStyle={{
                        backgroundColor: '#101010',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        color: '#f5f5f5',
                      }}
                      labelStyle={{ color: '#f5f5f5', fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ color: '#888', fontSize: '12px' }} />
                    <Bar dataKey="protein" name="Protein" stackId="macros" fill="#e4ff00" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="carbs" name="Carbs" stackId="macros" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="fat" name="Fat" stackId="macros" fill="#ff6b35" radius={[6, 6, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}
