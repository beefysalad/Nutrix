import { ChevronLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OnboardingStepHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-white uppercase">
        {title}
      </h2>
      <p className="mt-1 text-[#666]">{description}</p>
    </div>
  )
}

export function OnboardingNav({
  back,
  next,
  nextLabel = 'Next',
  disabled,
  loading,
}: {
  back: () => void
  next: () => void
  nextLabel?: string
  disabled?: boolean
  loading?: boolean
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={back}
        className="rounded-xl border border-white/10 bg-transparent text-[#777] transition-all hover:bg-transparent hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        onClick={next}
        disabled={disabled || loading}
        size="lg"
        className="flex items-center justify-center gap-2 rounded-xl bg-[#e4ff00] px-5 text-xs font-bold tracking-widest text-black uppercase transition-all hover:bg-[#f0ff4d] disabled:opacity-30"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>{nextLabel}</>
        )}
      </Button>
    </div>
  )
}
