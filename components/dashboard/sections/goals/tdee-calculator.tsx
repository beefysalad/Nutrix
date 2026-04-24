import { Calculator } from 'lucide-react'
import { type UseFormReturn, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type GoalsFormInput, type GoalsFormValues, type TdeeCalculatorInput, type TdeeCalculatorValues } from '@/lib/validations/dashboard-forms'

const activityMultipliers = {
  sedentary: 1.2,
  'lightly-active': 1.375,
  'moderately-active': 1.55,
  'very-active': 1.725,
} as const

function calculateTargets(values: TdeeCalculatorValues, mode: GoalsFormValues['mode']) {
  const baseCalories =
    values.sex === 'male'
      ? 10 * values.weightKg + 6.25 * values.heightCm - 5 * values.age + 5
      : 10 * values.weightKg + 6.25 * values.heightCm - 5 * values.age - 161

  const tdee = baseCalories * activityMultipliers[values.activityLevel]
  const calorieAdjustment =
    mode === 'cutting' ? -350 : mode === 'bulking' ? 250 : 0
  const dailyCalories = Math.max(1200, Math.round(tdee + calorieAdjustment))

  const proteinPerKg =
    mode === 'cutting' ? 2.2 : mode === 'bulking' ? 2 : 1.8
  const fatPerKg = 0.8
  const proteinGrams = Math.round(values.weightKg * proteinPerKg)
  const fatGrams = Math.round(values.weightKg * fatPerKg)
  const remainingCalories = dailyCalories - proteinGrams * 4 - fatGrams * 9
  const carbsGrams = Math.max(0, Math.round(remainingCalories / 4))

  return {
    dailyCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    tdee: Math.round(tdee),
  }
}

export function TdeeCalculator({
  tdeeForm,
  selectedMode,
  lastCalculatedTdee,
  setLastCalculatedTdee,
  goalsFormSetValue,
}: {
  tdeeForm: UseFormReturn<TdeeCalculatorInput, unknown, TdeeCalculatorValues>
  selectedMode: GoalsFormValues['mode']
  lastCalculatedTdee: number | null
  setLastCalculatedTdee: (val: number | null) => void
  goalsFormSetValue: UseFormReturn<GoalsFormInput, unknown, GoalsFormValues>['setValue']
}) {
  const tdeeSex = useWatch({ control: tdeeForm.control, name: 'sex' })
  const tdeeActivityLevel = useWatch({
    control: tdeeForm.control,
    name: 'activityLevel',
  })

  function handleTdeeApply(values: TdeeCalculatorValues) {
    const targets = calculateTargets(values, selectedMode)

    goalsFormSetValue('dailyCalories', targets.dailyCalories, { shouldDirty: true })
    goalsFormSetValue('proteinGrams', targets.proteinGrams, { shouldDirty: true })
    goalsFormSetValue('carbsGrams', targets.carbsGrams, { shouldDirty: true })
    goalsFormSetValue('fatGrams', targets.fatGrams, { shouldDirty: true })
    setLastCalculatedTdee(targets.tdee)
    toast.success('Calculated targets applied')
  }

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
      <div className="mb-4 flex items-center gap-2 text-sm text-[#f5f5f5]">
        <Calculator className="h-4 w-4 text-[#e4ff00]" />
        Estimate maintenance calories and apply a target for the selected goal mode.
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Select
          value={tdeeSex}
          onValueChange={(value) =>
            tdeeForm.setValue('sex', value as TdeeCalculatorValues['sex'], {
              shouldDirty: true,
            })
          }
        >
          <SelectTrigger className="h-12 w-full rounded-2xl border-white/10 bg-[#141414] px-4 py-3 text-[#f5f5f5] focus:border-[#e4ff00] focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#141414] text-[#f5f5f5]">
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={tdeeActivityLevel}
          onValueChange={(value) =>
            tdeeForm.setValue(
              'activityLevel',
              value as TdeeCalculatorValues['activityLevel'],
              {
                shouldDirty: true,
              },
            )
          }
        >
          <SelectTrigger className="h-12 w-full rounded-2xl border-white/10 bg-[#141414] px-4 py-3 text-[#f5f5f5] focus:border-[#e4ff00] focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#141414] text-[#f5f5f5]">
            <SelectItem value="sedentary">Sedentary</SelectItem>
            <SelectItem value="lightly-active">Lightly Active</SelectItem>
            <SelectItem value="moderately-active">Moderately Active</SelectItem>
            <SelectItem value="very-active">Very Active</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="number"
          placeholder="Age"
          {...tdeeForm.register('age')}
          className="rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
        />
        <input
          type="number"
          step="0.1"
          min="0"
          placeholder="Weight (kg)"
          {...tdeeForm.register('weightKg')}
          className="rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
        />
        <input
          type="number"
          placeholder="Height (cm)"
          {...tdeeForm.register('heightCm')}
          className="rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00] md:col-span-2"
        />
      </div>
      {Object.keys(tdeeForm.formState.errors).length > 0 ? (
        <div className="mt-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
          {tdeeForm.formState.errors.age?.message ||
            tdeeForm.formState.errors.weightKg?.message ||
            tdeeForm.formState.errors.heightCm?.message}
        </div>
      ) : null}
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-[#777]">
          {lastCalculatedTdee ? `Last estimated maintenance: ${lastCalculatedTdee} cal/day` : 'No estimate applied yet.'}
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => void tdeeForm.handleSubmit(handleTdeeApply)()}
          className="w-full rounded-2xl bg-[#e4ff00] px-4 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d] sm:w-auto"
        >
          Calculate & Apply
        </Button>
      </div>
    </div>
  )
}
