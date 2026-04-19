import { SectionCard, EmptyState } from '@/components/dashboard/ui'

export function OverviewSection() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionCard>
        <EmptyState
          title="Your dashboard will populate once data is connected"
          description="There are no mocked calories, macros, meals, or streaks anymore. The next step is wiring the new meal, goal, and profile tables into real queries."
        />
      </SectionCard>
    </div>
  )
}
