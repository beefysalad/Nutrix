import { type UseFormRegisterReturn } from 'react-hook-form'

export function DailyTargetsForm({
  registerDailyCalories,
  registerProtein,
  registerCarbs,
  registerFat,
  errors,
}: {
  registerDailyCalories: UseFormRegisterReturn
  registerProtein: UseFormRegisterReturn
  registerCarbs: UseFormRegisterReturn
  registerFat: UseFormRegisterReturn
  errors: Record<string, { message?: string }>
}) {
  return (
    <div className="space-y-4">
      <input
        type="number"
        placeholder="Daily calories"
        {...registerDailyCalories}
        className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 font-mono text-[#f5f5f5] outline-none focus:border-[#e4ff00]"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <input
          type="number"
          placeholder="Protein (g)"
          {...registerProtein}
          className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-3 py-3 font-mono text-[#f5f5f5] outline-none focus:border-[#e4ff00]"
        />
        <input
          type="number"
          placeholder="Carbs (g)"
          {...registerCarbs}
          className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-3 py-3 font-mono text-[#f5f5f5] outline-none focus:border-[#e4ff00]"
        />
        <input
          type="number"
          placeholder="Fat (g)"
          {...registerFat}
          className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-3 py-3 font-mono text-[#f5f5f5] outline-none focus:border-[#e4ff00]"
        />
      </div>
      {errors.dailyCalories || errors.proteinGrams || errors.carbsGrams || errors.fatGrams ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
          {errors.dailyCalories?.message ||
            errors.proteinGrams?.message ||
            errors.carbsGrams?.message ||
            errors.fatGrams?.message}
        </div>
      ) : null}
    </div>
  )
}
