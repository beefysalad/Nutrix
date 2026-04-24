import { SectionCard } from '@/components/dashboard/ui'

export function GoalsMetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
      {Array.from({ length: 4 }, (_, index) => (
        <SectionCard key={index} className="space-y-3">
          <div className="h-3 w-20 animate-pulse rounded-full bg-white/8 sm:h-4" />
          <div className="h-8 w-24 animate-pulse rounded-xl bg-white/10 sm:h-10" />
          <div className="h-3 w-16 animate-pulse rounded-full bg-white/6" />
        </SectionCard>
      ))}
    </div>
  )
}

export function GoalMetric({
  label,
  value,
  helper,
  accentText = 'text-[#e4ff00]',
  accentBorder = 'border-t-[#e4ff00]',
  accentGlow = 'shadow-[0_-2px_12px_rgba(228,255,0,0.15)]',
}: {
  label: string
  value: string
  helper: string
  accentText?: string
  accentBorder?: string
  accentGlow?: string
}) {
  return (
    <div className={`rounded-[1.4rem] border border-white/10 border-t-2 ${accentBorder} ${accentGlow} bg-[#141414] p-4 sm:rounded-2xl sm:p-5`}>
      <div className="text-[11px] text-[#777] sm:text-sm">{label}</div>
      <div className={`mt-3 font-mono text-2xl font-black sm:text-3xl ${accentText}`}>{value}</div>
      <div className="mt-2 text-[11px] uppercase tracking-wide text-[#666]">{helper}</div>
    </div>
  )
}

export function GoalsMetricsDisplay({
  isMetricsLoading,
  dailyCalories,
  proteinGrams,
  currentTotals,
}: {
  isMetricsLoading: boolean
  dailyCalories?: number
  proteinGrams?: number
  currentTotals?: { calories: number }
}) {
  if (isMetricsLoading) {
    return <GoalsMetricsSkeleton />
  }

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
      <GoalMetric
        label="Goal Calories"
        value={dailyCalories ? `${dailyCalories}` : 'Unset'}
        helper="daily target"
        accentText="text-[#e4ff00]"
        accentBorder="border-t-[#e4ff00]"
        accentGlow="shadow-[0_-2px_12px_rgba(228,255,0,0.15)]"
      />
      <GoalMetric
        label="Protein Target"
        value={proteinGrams ? `${proteinGrams}g` : 'Unset'}
        helper="per day"
        accentText="text-[#00ff88]"
        accentBorder="border-t-[#00ff88]"
        accentGlow="shadow-[0_-2px_12px_rgba(0,255,136,0.15)]"
      />
      <GoalMetric
        label="Consumed Today"
        value={currentTotals ? `${currentTotals.calories}` : '0'}
        helper="logged so far"
        accentText="text-[#38bdf8]"
        accentBorder="border-t-[#38bdf8]"
        accentGlow="shadow-[0_-2px_12px_rgba(56,189,248,0.15)]"
      />
      <GoalMetric
        label="Remaining"
        value={
          currentTotals && dailyCalories
            ? `${Number(dailyCalories) - currentTotals.calories}`
            : 'Set target'
        }
        helper="vs today"
        accentText="text-[#ff6b35]"
        accentBorder="border-t-[#ff6b35]"
        accentGlow="shadow-[0_-2px_12px_rgba(255,107,53,0.15)]"
      />
    </div>
  )
}
