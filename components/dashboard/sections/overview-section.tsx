import { Edit2, Flame, Target, Trash2 } from 'lucide-react'

import { dailyCaloriesData, donutData, macroData, mealTimelineData } from '@/components/dashboard/data'
import { MiniBarChart, MiniDonut } from '@/components/dashboard/charts'
import { SectionCard } from '@/components/dashboard/ui'

export function OverviewSection() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {macroData.map((macro) => {
          const percentage = Math.min((macro.current / macro.goal) * 100, 100)

          return (
            <SectionCard key={macro.name}>
              <div className="mb-2 text-sm text-[#888]">{macro.name}</div>
              <div className="mb-4 font-mono text-3xl text-[#f5f5f5]">
                {macro.current}
                <span className="ml-1 text-sm text-[#666]">/ {macro.goal}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-[#4ade80]" style={{ width: `${percentage}%` }} />
              </div>
            </SectionCard>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <SectionCard>
          <div className="mb-5 text-lg text-[#f5f5f5]">Daily Calories by Meal</div>
          <MiniBarChart data={dailyCaloriesData} />
        </SectionCard>
        <SectionCard>
          <div className="mb-5 text-lg text-[#f5f5f5]">Macro Split</div>
          <MiniDonut data={donutData} totalLabel="1650" />
        </SectionCard>
      </div>

      <SectionCard>
        <div className="mb-5 text-lg text-[#f5f5f5]">Today&apos;s Meals</div>
        <div className="space-y-3">
          {mealTimelineData.map((meal) => (
            <div
              key={meal.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 transition-colors hover:border-[#4ade80]/30 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-white/10 bg-[#141414] px-3 py-1 text-xs text-[#888]">
                  {meal.meal}
                </span>
                <div>
                  <div className="text-[#f5f5f5]">{meal.food}</div>
                  <div className="text-sm text-[#777]">{meal.items}</div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <span className="font-mono text-[#4ade80]">{meal.calories}</span>
                <span className="text-sm text-[#777]">{meal.time}</span>
                <div className="flex gap-2">
                  <button className="rounded-full p-2 text-[#888] transition-colors hover:bg-white/5 hover:text-white">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="rounded-full p-2 text-[#888] transition-colors hover:bg-white/5 hover:text-white">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard>
          <div className="mb-3 flex items-center gap-3">
            <Flame className="h-5 w-5 text-[#4ade80]" />
            <h3 className="text-[#f5f5f5]">Remaining Calories</h3>
          </div>
          <div className="font-mono text-4xl text-[#4ade80]">350</div>
          <div className="mt-1 text-sm text-[#777]">to reach your daily goal</div>
        </SectionCard>
        <SectionCard>
          <div className="mb-3 flex items-center gap-3">
            <Target className="h-5 w-5 text-[#4ade80]" />
            <h3 className="text-[#f5f5f5]">Current Streak</h3>
          </div>
          <div className="font-mono text-4xl text-[#4ade80]">14</div>
          <div className="mt-1 text-sm text-[#777]">days on target</div>
        </SectionCard>
      </div>
    </div>
  )
}
