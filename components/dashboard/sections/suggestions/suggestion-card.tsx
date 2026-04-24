import { Loader2, Trash2 } from 'lucide-react'

import { cn } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'

import type { SuggestionCard } from './types'

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

export function SuggestionCardButton({
  suggestion,
  onOpen,
  onRemove,
  removePending = false,
  showRemove = false,
}: {
  suggestion: SuggestionCard
  onOpen: () => void
  onRemove?: () => void
  removePending?: boolean
  showRemove?: boolean
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onOpen}
      className="group flex h-full min-h-[260px] w-full flex-col items-stretch justify-start whitespace-normal rounded-[1.35rem] border border-white/[0.08] bg-[#101010] p-4 text-left transition-colors hover:border-[#e4ff00]/25 hover:bg-[#131313]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[9px] font-black tracking-[0.18em] text-[#888] uppercase">
          {suggestion.difficulty}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-wider text-[#555] uppercase">
            {suggestion.prepTime}
          </span>
          {showRemove && onRemove ? (
            <span
              role="button"
              tabIndex={0}
              aria-label={`Remove ${suggestion.name} from saved suggestions`}
              onClick={(event) => {
                event.stopPropagation()
                onRemove()
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  event.stopPropagation()
                  onRemove()
                }
              }}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-black/20 text-[#555] transition-colors hover:border-red-500/30 hover:text-red-400',
                removePending && 'pointer-events-none opacity-60'
              )}
            >
              {removePending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 min-h-[86px]">
        <h3 className="line-clamp-2 text-base leading-snug font-semibold text-[#f1f1f1]">
          {suggestion.name}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#777]">
          {suggestion.description}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/[0.06] bg-black/20 p-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[9px] font-black tracking-[0.2em] text-[#555] uppercase">
              Calories
            </div>
            <div className="mt-1 font-mono text-xl font-black text-[#e4ff00]">
              {suggestion.calories}
              <span className="ml-1 text-[10px] tracking-wider text-[#6f7c00]">
                kcal
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-right">
            <MacroPill label="P" value={`${Math.round(suggestion.protein)}g`} />
            <MacroPill label="C" value={`${Math.round(suggestion.carbs)}g`} />
            <MacroPill label="F" value={`${Math.round(suggestion.fat)}g`} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {suggestion.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[9px] font-bold tracking-wide text-[#777] uppercase"
          >
            {tag}
          </span>
        ))}
      </div>
    </Button>
  )
}
