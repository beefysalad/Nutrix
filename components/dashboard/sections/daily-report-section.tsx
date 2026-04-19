'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Download, Loader2, Save, Share2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { EmptyState, SectionCard, cn } from '@/components/dashboard/ui'
import {
  getApiErrorMessage,
  useDailyReportQuery,
  useSaveDailyReportMutation,
} from '@/lib/hooks/use-dashboard-api'
import {
  dailyReportFormSchema,
  type DailyReportFormValues,
} from '@/lib/validations/dashboard-forms'

export function DailyReportSection() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const dailyReportQuery = useDailyReportQuery(selectedDate)
  const saveDailyReportMutation = useSaveDailyReportMutation()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DailyReportFormValues>({
    resolver: zodResolver(dailyReportFormSchema),
    defaultValues: {
      rating: 4,
      note: '',
    },
  })

  const rating = useWatch({
    control,
    name: 'rating',
  })

  useEffect(() => {
    reset({
      rating: dailyReportQuery.data?.report?.rating ?? 4,
      note: dailyReportQuery.data?.report?.note ?? '',
    })
  }, [dailyReportQuery.data?.report, reset])

  const report = useMemo(() => {
    const data = dailyReportQuery.data

    return {
      meals: data?.meals ?? [],
      totals: data?.totals ?? {
        calories: 0,
        proteinGrams: 0,
        carbsGrams: 0,
        fatGrams: 0,
        mealCount: 0,
      },
    }
  }, [dailyReportQuery.data])

  async function onSubmit(values: DailyReportFormValues) {
    try {
      await saveDailyReportMutation.mutateAsync({
        date: selectedDate,
        rating: values.rating,
        note: values.note,
      })
      toast.success('Daily report saved')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not save daily report'))
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex justify-end">
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 font-mono text-[#888] outline-none focus:border-[#e4ff00]"
          />
        </div>

        <SectionCard className="p-8">
          {dailyReportQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
            </div>
          ) : report.meals.length === 0 ? (
            <EmptyState
              title="No meals logged for this day"
              description="Pick another date or log a meal first. Once a day has entries, this report will summarize calories, macros, and your reflection."
            />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-3 md:grid-cols-4">
                <ReportMetric label="Calories" value={`${report.totals.calories}`} />
                <ReportMetric label="Protein" value={`${report.totals.proteinGrams.toFixed(1)}g`} />
                <ReportMetric label="Carbs" value={`${report.totals.carbsGrams.toFixed(1)}g`} />
                <ReportMetric label="Fat" value={`${report.totals.fatGrams.toFixed(1)}g`} />
              </div>

              <div className="space-y-3">
                {report.meals.map((meal) => (
                  <div key={meal.id} className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-medium capitalize text-[#f5f5f5]">
                          {meal.mealType}
                        </div>
                        <div className="mt-1 text-xs text-[#777]">
                          {meal.items.map((item) => item.foodNameSnapshot).join(', ')}
                        </div>
                      </div>
                      <div className="font-mono text-sm text-[#f5f5f5]">
                        {meal.items.reduce((sum, item) => sum + item.calories, 0)} cal
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mb-8 mt-8 border-t border-white/10 pt-8">
            <label className="mb-3 block text-sm text-[#777]">Rate your day</label>
            <div className="mb-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('rating', value, { shouldDirty: true })}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    value <= rating
                      ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                      : 'border-white/10 bg-[#0a0a0a] text-[#888] hover:border-[#e4ff00]/40',
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              {...register('note')}
              placeholder="Add a note about your day..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
            />
            {errors.rating || errors.note ? (
              <div className="mt-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
                {errors.rating?.message || errors.note?.message}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <button
                type="submit"
                disabled={isSubmitting || saveDailyReportMutation.isPending}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting || saveDailyReportMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Reflection
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] transition-colors hover:border-[#e4ff00]/50"
                onClick={() => toast.message('Export is not wired yet')}
              >
                <Download className="h-4 w-4" />
                Export as Image
              </button>
             
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-[#666]">{label}</div>
      <div className="mt-2 font-mono text-xl text-[#f5f5f5]">{value}</div>
    </div>
  )
}
