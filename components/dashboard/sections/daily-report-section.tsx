'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Download, Loader2, Save, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { EmptyState, SectionCard, cn } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
import {
  getApiErrorMessage,
  useDailyReportQuery,
  useSaveDailyReportMutation,
} from '@/hooks/dashboard'
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

        <SectionCard className="p-4 sm:p-8">
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
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex min-h-28 flex-col items-center justify-center rounded-3xl border border-[#e4ff00]/10 bg-[#e4ff00]/5 px-5 py-8 text-center shadow-2xl sm:col-span-1 sm:items-start sm:px-8 sm:py-6 sm:text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#555]">Daily Energy</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-5xl font-black tracking-tighter text-[#e4ff00]">
                      {report.totals.calories}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#444]">kcal</span>
                  </div>
                </div>
                
                <div className="col-span-2 grid grid-cols-3 gap-3 sm:col-span-1">
                  <div className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#1a1a1a] p-4 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#444]">Protein</span>
                    <span className="mt-1 text-lg font-black text-[#aaa]">{report.totals.proteinGrams.toFixed(0)}<span className="ml-0.5 text-xs text-[#555]">g</span></span>
                  </div>
                  <div className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#1a1a1a] p-4 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#444]">Carbs</span>
                    <span className="mt-1 text-lg font-black text-[#aaa]">{report.totals.carbsGrams.toFixed(0)}<span className="ml-0.5 text-xs text-[#555]">g</span></span>
                  </div>
                  <div className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#1a1a1a] p-4 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#444]">Fat</span>
                    <span className="mt-1 text-lg font-black text-[#aaa]">{report.totals.fatGrams.toFixed(0)}<span className="ml-0.5 text-xs text-[#555]">g</span></span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-white/5 pt-4">
                {report.meals.map((meal) => (
                  <div key={meal.id} className="rounded-2xl border border-white/10 bg-[#141414]/50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold capitalize text-[#f5f5f5]">
                          {meal.mealType}
                        </div>
                        <div className="mt-1 text-[11px] text-[#555]">
                          {meal.items.map((item) => item.foodNameSnapshot).join(', ')}
                        </div>
                      </div>
                      <div className="font-mono text-sm font-bold text-[#e4ff00]">
                        {meal.items.reduce((sum, item) => sum + item.calories, 0)} <span className="text-[10px] text-[#444]">cal</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mb-8 mt-8 border-t border-white/10 pt-8">
            <label className="mb-4 block text-[10px] font-black uppercase tracking-widest text-[#555]">Daily Reflection</label>
            <div className="mb-3 flex justify-between gap-2 sm:justify-start">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  type="button"
                  onClick={() => setValue('rating', value, { shouldDirty: true })}
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all sm:h-14 sm:w-14',
                    value <= rating
                      ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a] shadow-[0_0_15px_rgba(228,255,0,0.3)]'
                      : 'border-white/5 bg-[#141414] text-[#444] hover:border-white/10',
                  )}
                  aria-label={`Rate ${value} out of 5`}
                >
                  <Star className={cn('h-5 w-5 sm:h-6 sm:w-6', value <= rating && 'fill-current')} />
                </Button>
              ))}
            </div>
            <div className="mb-6 text-xs uppercase tracking-wide text-[#666]">
              {rating} / 5 reflection score
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
              <Button
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
              </Button>
              <Button
                type="button"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] transition-colors hover:border-[#e4ff00]/50"
                onClick={() => toast.message('Export is not wired yet')}
              >
                <Download className="h-4 w-4" />
                Export as Image
              </Button>
             
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}
