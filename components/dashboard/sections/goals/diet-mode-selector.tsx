import { dietModes } from '@/components/dashboard/data'
import { cn } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
import { type GoalsFormValues } from '@/lib/validations/dashboard-forms'

export function DietModeSelector({
  selectedMode,
  onChangeMode,
}: {
  selectedMode: GoalsFormValues['mode']
  onChangeMode: (mode: GoalsFormValues['mode']) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
      {dietModes.map((mode) => (
        <Button
          key={mode.id}
          type="button"
          variant="ghost"
          size="default"
          onClick={() => onChangeMode(mode.id as GoalsFormValues['mode'])}
          className={cn(
            'h-auto w-full justify-start whitespace-normal rounded-[1.4rem] border px-4 py-3 text-left transition-all hover:bg-transparent sm:rounded-2xl sm:px-5 sm:py-4',
            selectedMode === mode.id
              ? 'border-[#e4ff00] bg-[#e4ff00]/5'
              : 'border-white/10 bg-[#141414]/70 hover:border-[#e4ff00]/30',
          )}
        >
          <div className="flex w-full flex-col items-start text-left">
            <div className="mb-1.5 flex w-full items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-[#f5f5f5]">
                {mode.label}
              </h3>
              {selectedMode === mode.id ? (
                <span className="rounded-full bg-[#e4ff00] px-1.5 py-0.5 text-[9px] font-black text-[#0a0a0a]">
                  ✓
                </span>
              ) : null}
            </div>
            <p className="block max-w-full text-sm leading-snug text-[#6f6f6f] sm:text-sm sm:text-[#777]">
              {mode.description}
            </p>
          </div>
        </Button>
      ))}
    </div>
  )
}
