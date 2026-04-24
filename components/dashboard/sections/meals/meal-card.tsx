import { Bot, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type MealResponse } from '@/lib/hooks/use-dashboard-api'
import { formatTime, mealCalories, mealMacroTotals } from './utils'

function MacroPill({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[8px] font-black tracking-widest text-[#555] uppercase">
        {label}
      </div>
      <div className="mt-1 font-mono text-xs font-bold text-[#d7d7d7]">
        {value}
      </div>
    </div>
  )
}

export function MealCard({
  meal,
  onDelete,
  onFeedback,
  deletePending,
}: {
  meal: MealResponse
  onDelete: () => void
  onFeedback: (fb: 'accurate' | 'inaccurate') => void
  deletePending: boolean
}) {
  const cal = mealCalories(meal)
  const mealLabel =
    meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)
  const isAi = meal.source === 'ai' || meal.source === 'telegram'
  const macros = mealMacroTotals(meal)

  const title = meal.items.map((i) => i.foodNameSnapshot).join(', ')

  return (
    <div className="group flex h-full min-h-[220px] flex-col rounded-[1.35rem] border border-white/[0.08] bg-[#101010] p-4 transition-colors duration-200 hover:border-[#e4ff00]/25 hover:bg-[#131313]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[9px] font-black tracking-[0.18em] text-[#888] uppercase">
            {mealLabel}
          </span>
          <span className="text-[10px] font-bold tracking-wider text-[#555] uppercase">
            {formatTime(meal.loggedAt)}
          </span>
          {isAi && (
            <span className="flex items-center gap-0.5 rounded-full border border-white/5 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#666] uppercase">
              <Bot className="h-2.5 w-2.5 text-[#e4ff00]/50" />
              AI
            </span>
          )}
        </div>
        <Button
          type="button"
          disabled={deletePending}
          onClick={onDelete}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-black/20 text-[#444] transition-colors hover:border-red-500/30 hover:text-red-400 md:opacity-0 md:group-hover:opacity-100"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="mt-3 min-h-[64px]">
        <div className="line-clamp-2 text-sm leading-snug font-semibold text-[#f1f1f1]">
          {title}
        </div>
        <div className="mt-1 text-[11px] text-[#666]">
          {meal.items.length} {meal.items.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/[0.06] bg-black/20 p-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[9px] font-black tracking-[0.22em] text-[#555] uppercase">
              Calories
            </div>
            <div className="mt-1 font-mono text-xl font-black text-[#e4ff00]">
              {cal}
              <span className="ml-1 text-[10px] tracking-wider text-[#6f7c00]">
                kcal
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-right">
            <MacroPill label="P" value={`${Math.round(macros.protein)}g`} />
            <MacroPill label="C" value={`${Math.round(macros.carbs)}g`} />
            <MacroPill label="F" value={`${Math.round(macros.fat)}g`} />
          </div>
        </div>
      </div>

      {isAi && !meal.aiFeedback ? (
        <div className="mt-3 flex min-h-[22px] items-center gap-3 border-t border-white/[0.05] pt-2 text-[10px]">
          <span className="font-bold tracking-widest text-[#444] uppercase">
            Accurate?
          </span>
          <Button
            onClick={() => onFeedback('accurate')}
            className="font-black tracking-tighter text-[#555] uppercase transition-colors hover:text-[#e4ff00]"
          >
            Yes
          </Button>
          <Button
            onClick={() => onFeedback('inaccurate')}
            className="font-black tracking-tighter text-[#555] uppercase transition-colors hover:text-red-400/70"
          >
            No
          </Button>
        </div>
      ) : (
        <div className="mt-3 min-h-[22px]" />
      )}
    </div>
  )
}
