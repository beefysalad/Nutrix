import { type UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '@/components/dashboard/ui'

export function OnboardingInput({
  label,
  register,
  error,
}: {
  label: string
  register: UseFormRegisterReturn
  error?: string
}) {
  const isWeightField = label.toLowerCase().includes('weight')

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold tracking-widest text-[#555] uppercase">
        {label}
      </label>
      <input
        {...register}
        type="number"
        step={isWeightField ? '0.1' : '1'}
        min="0"
        className={cn(
          'w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 font-mono text-white transition-all outline-none focus:border-[#e4ff00]',
          error && 'border-red-500/50 text-red-100'
        )}
      />
      {error && (
        <div className="text-[10px] tracking-tighter text-red-400 uppercase">
          {error}
        </div>
      )}
    </div>
  )
}
