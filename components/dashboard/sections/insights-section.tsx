import { BarChart3, Flame, Sparkles, Target, TrendingUp, Utensils } from 'lucide-react'

import { insightCards } from '@/components/dashboard/data'
import { SectionCard } from '@/components/dashboard/ui'

const iconMap = [TrendingUp, Target, Utensils, BarChart3, Sparkles, Flame]

export function InsightsSection() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionCard>
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-[#4ade80]/10 p-3">
            <Sparkles className="h-5 w-5 text-[#4ade80]" />
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg text-[#f5f5f5]">AI Weekly Insight</h3>
              <span className="rounded-full bg-[#4ade80] px-2 py-0.5 text-xs font-medium text-[#0a0a0a]">AI</span>
            </div>
            <p className="leading-relaxed text-[#888]">
              Your nutrition consistency has improved by 15% this week compared to last. Protein intake is staying close to 120g daily, which is strong, but carb intake still swings between weekdays and weekends. A more structured weekend lunch could stabilize the curve without making the app feel rigid.
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {insightCards.map((card, index) => {
          const Icon = iconMap[index] ?? Sparkles

          return (
            <SectionCard key={card.title} className="transition-colors hover:border-[#4ade80]/20">
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-xl bg-[#0a0a0a] p-2">
                  <Icon className="h-4 w-4 text-[#888]" />
                </div>
                <h4 className="flex-1 text-[#f5f5f5]">{card.title}</h4>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-[#888]">{card.body}</p>
              <div className="border-t border-white/10 pt-4 font-mono text-sm text-[#4ade80]">{card.highlight}</div>
            </SectionCard>
          )
        })}
      </div>
    </div>
  )
}
