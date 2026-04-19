'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Calculator, Check, Loader2, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { dietModes } from '@/components/dashboard/data'
import { SectionCard, cn } from '@/components/dashboard/ui'
import {
  getApiErrorMessage,
  useDashboardSummaryQuery,
  useGoalsQuery,
  useSaveGoalsMutation,
  useTelegramIntegrationQuery,
} from '@/lib/hooks/use-dashboard-api'
import {
  goalsFormSchema,
  tdeeCalculatorSchema,
  type GoalsFormInput,
  type GoalsFormValues,
  type TdeeCalculatorInput,
  type TdeeCalculatorValues,
} from '@/lib/validations/dashboard-forms'

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

export function GoalsSection() {
  const [showTdee, setShowTdee] = useState(false)
  const [lastCalculatedTdee, setLastCalculatedTdee] = useState<number | null>(null)
  const goalsQuery = useGoalsQuery()
  const summaryQuery = useDashboardSummaryQuery()
  const telegramQuery = useTelegramIntegrationQuery()
  const saveGoalsMutation = useSaveGoalsMutation()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<GoalsFormInput, unknown, GoalsFormValues>({
    resolver: zodResolver(goalsFormSchema),
    defaultValues: {
      mode: 'cutting',
      dailyCalories: undefined,
      proteinGrams: undefined,
      carbsGrams: undefined,
      fatGrams: undefined,
      reportTime: '20:00',
      telegramReminders: false,
    },
  })

  const tdeeForm = useForm<TdeeCalculatorInput, unknown, TdeeCalculatorValues>({
    resolver: zodResolver(tdeeCalculatorSchema),
    defaultValues: {
      sex: 'male',
      age: 25,
      weightKg: 70,
      heightCm: 170,
      activityLevel: 'moderately-active',
    },
  })

  const selectedMode = useWatch({ control, name: 'mode' })
  const dailyCalories = useWatch({ control, name: 'dailyCalories' })
  const proteinGrams = useWatch({ control, name: 'proteinGrams' })

  useEffect(() => {
    if (!goalsQuery.data?.goal) {
      return
    }

    reset({
      mode: goalsQuery.data.goal.mode,
      dailyCalories: goalsQuery.data.goal.dailyCalories ?? undefined,
      proteinGrams: goalsQuery.data.goal.proteinGrams ?? undefined,
      carbsGrams: goalsQuery.data.goal.carbsGrams ?? undefined,
      fatGrams: goalsQuery.data.goal.fatGrams ?? undefined,
      reportTime: '20:00',
      telegramReminders: false,
    })
  }, [goalsQuery.data, reset])

  async function onSubmit(values: GoalsFormValues) {
    try {
      await saveGoalsMutation.mutateAsync({
        mode: values.mode,
        dailyCalories: values.dailyCalories,
        proteinGrams: values.proteinGrams,
        carbsGrams: values.carbsGrams,
        fatGrams: values.fatGrams,
      })
      toast.success('Goals saved')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not save goals'))
    }
  }

  function handleTdeeApply(values: TdeeCalculatorValues) {
    const targets = calculateTargets(values, selectedMode)

    setValue('dailyCalories', targets.dailyCalories, { shouldDirty: true })
    setValue('proteinGrams', targets.proteinGrams, { shouldDirty: true })
    setValue('carbsGrams', targets.carbsGrams, { shouldDirty: true })
    setValue('fatGrams', targets.fatGrams, { shouldDirty: true })
    setLastCalculatedTdee(targets.tdee)
    toast.success('Calculated targets applied')
  }

  const currentTotals = summaryQuery.data?.totals
  const telegramStatus = telegramQuery.data?.connection

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="mb-2 text-2xl text-[#f5f5f5]">Nutrition Goals</h2>
        <p className="text-sm text-[#777]">Set your daily targets and keep them grounded in real intake data.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <GoalMetric
          label="Goal Calories"
          value={dailyCalories ? `${dailyCalories}` : 'Unset'}
          helper="daily target"
        />
        <GoalMetric
          label="Protein Target"
          value={proteinGrams ? `${proteinGrams}g` : 'Unset'}
          helper="per day"
        />
        <GoalMetric
          label="Consumed Today"
          value={currentTotals ? `${currentTotals.calories}` : '0'}
          helper="logged so far"
        />
        <GoalMetric
          label="Remaining"
          value={
            currentTotals && dailyCalories
              ? `${Number(dailyCalories) - currentTotals.calories}`
              : 'Set target'
          }
          helper="vs today"
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {dietModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setValue('mode', mode.id as GoalsFormValues['mode'], { shouldDirty: true })}
              className={cn(
                'rounded-2xl border-2 p-5 text-left transition-all',
                selectedMode === mode.id
                  ? 'border-[#e4ff00] bg-[#e4ff00]/5'
                  : 'border-white/10 bg-[#141414] hover:border-[#e4ff00]/30',
              )}
            >
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-[#f5f5f5]">{mode.label}</h3>
                {selectedMode === mode.id ? (
                  <span className="rounded-full bg-[#e4ff00] p-1 text-[10px] font-bold text-[#0a0a0a]">
                    OK
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-[#777]">{mode.description}</p>
            </button>
          ))}
        </div>

        <SectionCard>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg text-[#f5f5f5]">Daily Targets</h3>
              <p className="mt-1 text-sm text-[#777]">Save the calories and macros Nutrix should optimize around.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowTdee((value) => !value)}
              className="rounded-full border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-sm text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-[#e4ff00]"
            >
              {showTdee ? 'Hide TDEE' : 'Open TDEE'}
            </button>
          </div>

          {showTdee ? (
            <div className="mb-6 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
              <div className="mb-4 flex items-center gap-2 text-sm text-[#f5f5f5]">
                <Calculator className="h-4 w-4 text-[#e4ff00]" />
                Estimate maintenance calories and apply a target for the selected goal mode.
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  {...tdeeForm.register('sex')}
                  className="rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 text-[#f5f5f5] outline-none focus:border-[#e4ff00]"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <select
                  {...tdeeForm.register('activityLevel')}
                  className="rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 text-[#f5f5f5] outline-none focus:border-[#e4ff00]"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="lightly-active">Lightly Active</option>
                  <option value="moderately-active">Moderately Active</option>
                  <option value="very-active">Very Active</option>
                </select>
                <input
                  type="number"
                  placeholder="Age"
                  {...tdeeForm.register('age')}
                  className="rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
                />
                <input
                  type="number"
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
                <button
                  type="button"
                  onClick={() => void tdeeForm.handleSubmit(handleTdeeApply)()}
                  className="rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d]"
                >
                  Calculate & Apply
                </button>
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            <input
              type="number"
              placeholder="Daily calories"
              {...register('dailyCalories')}
              className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 font-mono text-[#f5f5f5] outline-none focus:border-[#e4ff00]"
            />
            <div className="grid gap-4 md:grid-cols-3">
              <input
                type="number"
                placeholder="Protein (g)"
                {...register('proteinGrams')}
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 font-mono text-[#f5f5f5] outline-none focus:border-[#e4ff00]"
              />
              <input
                type="number"
                placeholder="Carbs (g)"
                {...register('carbsGrams')}
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 font-mono text-[#f5f5f5] outline-none focus:border-[#e4ff00]"
              />
              <input
                type="number"
                placeholder="Fat (g)"
                {...register('fatGrams')}
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 font-mono text-[#f5f5f5] outline-none focus:border-[#e4ff00]"
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
        </SectionCard>

        <SectionCard>
          <h3 className="mb-4 text-lg text-[#f5f5f5]">Delivery</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#e4ff00]/10 p-2">
                  {telegramStatus?.status === 'connected' ? (
                    <Check className="h-5 w-5 text-[#e4ff00]" />
                  ) : (
                    <Send className="h-5 w-5 text-[#e4ff00]" />
                  )}
                </span>
                <div>
                  <div className="text-[#f5f5f5]">Telegram reminders</div>
                  <div className="text-sm text-[#777]">
                    {telegramStatus?.status === 'connected'
                      ? telegramStatus.username
                        ? `Connected as @${telegramStatus.username}`
                        : 'Connected and ready for Telegram meal logging'
                      : 'Connect Telegram in Settings to log meals and receive future reminders'}
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  'rounded-full border px-3 py-1 text-xs uppercase tracking-wide',
                  telegramStatus?.status === 'connected'
                    ? 'border-[#e4ff00]/30 bg-[#e4ff00]/10 text-[#e4ff00]'
                    : 'border-white/10 bg-[#141414] text-[#888]',
                )}
              >
                {telegramStatus?.status ?? 'disconnected'}
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#0a0a0a] p-4 text-sm text-[#777]">
              Daily report delivery time is not persisted yet, so this page now focuses on real nutrition targets instead of fake notification controls.
            </div>
          </div>
        </SectionCard>

        <button
          type="submit"
          disabled={goalsQuery.isLoading || isSubmitting || saveGoalsMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting || saveGoalsMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {goalsQuery.isLoading
            ? 'Loading Goals'
            : isSubmitting || saveGoalsMutation.isPending
              ? 'Saving Goals'
              : 'Save Goals'}
        </button>
      </form>
    </div>
  )
}

function GoalMetric({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <SectionCard>
      <div className="text-sm text-[#777]">{label}</div>
      <div className="mt-3 font-mono text-3xl text-[#f5f5f5]">{value}</div>
      <div className="mt-2 text-xs uppercase tracking-wide text-[#666]">{helper}</div>
    </SectionCard>
  )
}
