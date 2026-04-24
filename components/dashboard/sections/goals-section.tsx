'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { SectionCard } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
import {
  getApiErrorMessage,
  useDashboardSummaryQuery,
  useGoalsQuery,
  useSaveGoalsMutation,
} from '@/hooks/dashboard'
import {
  goalsFormSchema,
  tdeeCalculatorSchema,
  type GoalsFormInput,
  type GoalsFormValues,
  type TdeeCalculatorInput,
  type TdeeCalculatorValues,
} from '@/lib/validations/dashboard-forms'

import { DailyTargetsForm } from './goals/daily-targets-form'
import { DietModeSelector } from './goals/diet-mode-selector'
import { GoalsMetricsDisplay } from './goals/goal-metrics'
import { TdeeCalculator } from './goals/tdee-calculator'

export function GoalsSection() {
  const [showTdee, setShowTdee] = useState(false)
  const [lastCalculatedTdee, setLastCalculatedTdee] = useState<number | null>(null)
  const goalsQuery = useGoalsQuery()
  const summaryQuery = useDashboardSummaryQuery()
  const saveGoalsMutation = useSaveGoalsMutation()
  
  const form = useForm<GoalsFormInput, unknown, GoalsFormValues>({
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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = form

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

  const selectedMode = useWatch({ control, name: 'mode' }) as GoalsFormValues['mode']
  const dailyCalories = useWatch({ control, name: 'dailyCalories' }) as number | undefined
  const proteinGrams = useWatch({ control, name: 'proteinGrams' }) as number | undefined

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

  useEffect(() => {
    const profile = goalsQuery.data?.profile

    if (!profile) {
      return
    }

    tdeeForm.reset({
      sex: profile.gender ?? 'male',
      age: profile.age ?? 25,
      weightKg: profile.weightKg ?? 70,
      heightCm: profile.heightCm ?? 170,
      activityLevel: profile.activityLevel ?? 'moderately-active',
    })
  }, [goalsQuery.data?.profile, tdeeForm])

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

  const currentTotals = summaryQuery.data?.totals
  const isMetricsLoading = goalsQuery.isLoading || summaryQuery.isLoading

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="mb-2 text-2xl text-[#f5f5f5]">Nutrition Goals</h2>
        <p className="text-sm text-[#777]">Set your daily targets and keep them grounded in real intake data.</p>
      </div>

      <GoalsMetricsDisplay
        isMetricsLoading={isMetricsLoading}
        dailyCalories={dailyCalories}
        proteinGrams={proteinGrams}
        currentTotals={currentTotals}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <DietModeSelector
          selectedMode={selectedMode}
          onChangeMode={(mode) => setValue('mode', mode, { shouldDirty: true })}
        />

        <SectionCard>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg text-[#f5f5f5]">Daily Targets</h3>
              <p className="mt-1 text-sm text-[#777]">Save the calories and macros Nutrix should optimize around.</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTdee((value) => !value)}
              className="self-start rounded-full border border-white/10 bg-[#0a0a0a] px-3 text-sm text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:bg-[#0a0a0a] hover:text-[#e4ff00]"
            >
              {showTdee ? 'Hide TDEE' : 'Open TDEE'}
            </Button>
          </div>

          {showTdee ? (
            <TdeeCalculator
              tdeeForm={tdeeForm}
              selectedMode={selectedMode}
              lastCalculatedTdee={lastCalculatedTdee}
              setLastCalculatedTdee={setLastCalculatedTdee}
              goalsFormSetValue={setValue}
            />
          ) : null}

          <DailyTargetsForm
            registerDailyCalories={register('dailyCalories')}
            registerProtein={register('proteinGrams')}
            registerCarbs={register('carbsGrams')}
            registerFat={register('fatGrams')}
            errors={errors as Record<string, { message?: string }>}
          />
        </SectionCard>

        <Button
          type="submit"
          size="lg"
          disabled={goalsQuery.isLoading || isSubmitting || saveGoalsMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting || saveGoalsMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {goalsQuery.isLoading
            ? 'Loading Goals'
            : isSubmitting || saveGoalsMutation.isPending
              ? 'Saving Goals'
              : 'Save Goals'}
        </Button>
      </form>
    </div>
  )
}
