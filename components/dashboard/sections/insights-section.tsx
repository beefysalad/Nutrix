import { Sparkles } from 'lucide-react'

import { EmptyState, SectionCard } from '@/components/dashboard/ui'

export function InsightsSection() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionCard>
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-[#e4ff00]/10 p-3">
            <Sparkles className="h-5 w-5 text-[#e4ff00]" />
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg text-[#f5f5f5]">AI Weekly Insight</h3>
              <span className="rounded-full bg-[#e4ff00] px-2 py-0.5 text-xs font-medium text-[#0a0a0a]">AI</span>
            </div>
            <p className="leading-relaxed text-[#888]">
              No insight is generated yet. This panel is reserved for future computed or AI-derived summaries once enough real nutrition history exists.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <EmptyState
          title="Insights need real nutrition history"
          description="The fabricated insight cards are gone. Once daily summaries and meal patterns are queryable, this screen can surface real product insights or AI-generated summaries."
        />
      </SectionCard>
    </div>
  )
}
