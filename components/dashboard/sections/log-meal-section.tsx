'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, Loader2, PlusCircle, Search } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { EmptyState, SectionCard, cn } from '@/components/dashboard/ui'
import {
  getApiErrorMessage,
  useCreateMealMutation,
  useParseMealMutation,
  usePreferencesQuery,
  type ParsedMeal,
} from '@/lib/hooks/use-dashboard-api'
import {
  aiMealParseFormSchema,
  manualMealFormSchema,
  type AiMealParseFormValues,
  type ManualMealFormInput,
  type ManualMealFormValues,
} from '@/lib/validations/dashboard-forms'

type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other'
type AiModel = 'gemini-2.5-flash-lite' | 'gemini-2.5-flash'
type AiFeedback = 'accurate' | 'inaccurate' | null

export function LogMealSection() {
  const [activeTab, setActiveTab] = useState<'search' | 'custom' | 'ai'>('search')
  const [selectedMealTag, setSelectedMealTag] = useState<MealType>('breakfast')
  const [aiResult, setAiResult] = useState<ParsedMeal | null>(null)
  const [usedModel, setUsedModel] = useState<string | null>(null)
  const [fallbackFrom, setFallbackFrom] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiFeedback, setAiFeedback] = useState<AiFeedback>(null)

  const preferencesQuery = usePreferencesQuery()
  const parseMealMutation = useParseMealMutation()
  const createMealMutation = useCreateMealMutation()

  const aiForm = useForm<AiMealParseFormValues>({
    resolver: zodResolver(aiMealParseFormSchema),
    defaultValues: {
      text: '',
    },
  })

  const manualForm = useForm<ManualMealFormInput, unknown, ManualMealFormValues>({
    resolver: zodResolver(manualMealFormSchema),
    defaultValues: {
      foodName: '',
      calories: undefined,
      proteinGrams: undefined,
      carbsGrams: undefined,
      fatGrams: undefined,
      servingSize: '',
    },
  })

  const resolvedPreferredModel: AiModel =
    preferencesQuery.data?.preferences.aiModel ?? 'gemini-2.5-flash-lite'

  const tabs = [
    { id: 'search', label: 'Search', description: 'Look up foods', icon: Search },
    { id: 'custom', label: 'Custom', description: 'Add manually', icon: PlusCircle },
    { id: 'ai', label: 'AI Parsing', description: 'Paste meal text', icon: Bot },
  ] as const

  async function handleAiParse(values: AiMealParseFormValues) {
    setAiError(null)
    setAiResult(null)
    setFallbackFrom(null)
    setAiFeedback(null)

    try {
      const data = await parseMealMutation.mutateAsync({
        text: values.text,
        mealType: selectedMealTag,
      })

      setAiResult(data.parsed)
      setUsedModel(data.model ?? null)
      setFallbackFrom(data.fallbackFrom ?? null)
      toast.success('Meal parsed with Gemini')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to parse meal')
      setAiError(message)
      toast.error(message)
    }
  }

  async function saveParsedMeal() {
    if (!aiResult) {
      return
    }

    try {
      await createMealMutation.mutateAsync({
        mealType: aiResult.mealType ?? selectedMealTag,
        source: 'ai',
        aiFeedback: aiFeedback ?? undefined,
        notes: aiResult.notes ?? aiForm.getValues('text'),
        items: aiResult.items.map((item) => ({
          foodName: item.foodName,
          quantity: item.quantity ?? undefined,
          unit: item.unit ?? undefined,
          calories: Math.round(item.calories),
          proteinGrams: item.proteinGrams ?? undefined,
          carbsGrams: item.carbsGrams ?? undefined,
          fatGrams: item.fatGrams ?? undefined,
        })),
      })

      toast.success('Meal saved')
      aiForm.reset()
      setAiResult(null)
      setAiError(null)
      setFallbackFrom(null)
      setUsedModel(null)
      setAiFeedback(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save parsed meal'))
    }
  }

  async function handleManualSubmit(values: ManualMealFormValues) {
    try {
      await createMealMutation.mutateAsync({
        mealType: selectedMealTag,
        source: 'manual',
        notes: values.servingSize?.trim() || undefined,
        items: [
          {
            foodName: values.foodName,
            calories: values.calories,
            proteinGrams:
              values.proteinGrams && !Number.isNaN(values.proteinGrams)
                ? values.proteinGrams
                : undefined,
            carbsGrams:
              values.carbsGrams && !Number.isNaN(values.carbsGrams)
                ? values.carbsGrams
                : undefined,
            fatGrams:
              values.fatGrams && !Number.isNaN(values.fatGrams)
                ? values.fatGrams
                : undefined,
          },
        ],
      })

      toast.success('Custom meal saved')
      manualForm.reset({
        foodName: '',
        calories: undefined,
        proteinGrams: undefined,
        carbsGrams: undefined,
        fatGrams: undefined,
        servingSize: '',
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save custom meal'))
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#f5f5f5]">Log Meal</h2>
          <p className="mt-1 text-sm text-[#777]">
            Pick a meal, choose an input mode, and keep the flow quick on mobile.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {(['breakfast', 'lunch', 'snack', 'dinner'] as MealType[]).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedMealTag(tag)}
              className={cn(
                'rounded-2xl border px-4 py-3 text-sm font-medium capitalize transition-colors sm:rounded-full sm:px-4 sm:py-2',
                selectedMealTag === tag
                  ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                  : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]',
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <SectionCard className="overflow-hidden p-0">
        <div className="border-b border-white/10 p-3 sm:p-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const selected = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors',
                    selected
                      ? 'border-[#e4ff00] bg-[#e4ff00]/8 text-[#f5f5f5]'
                      : 'border-white/10 bg-[#0f0f0f] text-[#888] hover:border-[#e4ff00]/30 hover:text-[#f5f5f5]',
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 rounded-xl border p-2',
                      selected
                        ? 'border-[#e4ff00]/30 bg-[#e4ff00] text-[#0a0a0a]'
                        : 'border-white/10 bg-[#141414] text-[#888]',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className={cn('text-sm font-medium', selected ? 'text-white' : 'text-[#d0d0d0]')}>
                      {tab.label}
                    </div>
                    <div className="mt-1 text-xs text-[#777]">{tab.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'search' ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-4">
                <div className="mb-1 text-sm font-medium text-[#f5f5f5]">Search food</div>
                <div className="text-xs text-[#777]">
                  Best for quick entry once a food source or internal food library is connected.
                </div>
              </div>
              <input
                type="text"
                placeholder="Search for food..."
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
              />
              <EmptyState
                title="Food search is not connected yet"
                description="The next step here is a real food search provider or your own saved foods table."
              />
            </div>
          ) : null}

          {activeTab === 'custom' ? (
            <form onSubmit={manualForm.handleSubmit(handleManualSubmit)} className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-4">
                <div className="mb-1 text-sm font-medium text-[#f5f5f5]">Manual entry</div>
                <div className="text-xs text-[#777]">
                  Good for custom foods, recipes, or quick nutrition snapshots while the database is still minimal.
                </div>
              </div>
              <input
                type="text"
                placeholder="Food name"
                {...manualForm.register('foodName')}
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="number"
                  placeholder="Calories"
                  {...manualForm.register('calories')}
                  className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 font-mono text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
                />
                <input
                  type="number"
                  placeholder="Protein (g)"
                  {...manualForm.register('proteinGrams')}
                  className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 font-mono text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
                />
                <input
                  type="number"
                  placeholder="Carbs (g)"
                  {...manualForm.register('carbsGrams')}
                  className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 font-mono text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
                />
                <input
                  type="number"
                  placeholder="Fat (g)"
                  {...manualForm.register('fatGrams')}
                  className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 font-mono text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
                />
              </div>
              <input
                type="text"
                placeholder="Serving size"
                {...manualForm.register('servingSize')}
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
              />
              {manualForm.formState.errors.foodName || manualForm.formState.errors.calories ? (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {manualForm.formState.errors.foodName?.message ||
                    manualForm.formState.errors.calories?.message}
                </div>
              ) : null}
              <button
                type="submit"
                disabled={manualForm.formState.isSubmitting || createMealMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3.5 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {manualForm.formState.isSubmitting || createMealMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
                Add Custom Food
              </button>
            </form>
          ) : null}

          {activeTab === 'ai' ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-4">
                <div className="mb-1 text-sm font-medium text-[#f5f5f5]">AI meal parse</div>
                <div className="text-xs text-[#777]">
                  Paste a natural sentence like “chicken rice and iced coffee” and let AI structure it into meal items.
                </div>
                <div className="mt-2 text-xs text-[#999]">
                  AI nutrition estimates may be imperfect, so review the parsed calories and macros before saving.
                </div>
                <div className="mt-3 inline-flex rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/10 px-3 py-1 text-[11px] uppercase tracking-wide text-[#e4ff00]">
                  Using {resolvedPreferredModel === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' : 'Gemini 2.5 Flash-Lite'}
                </div>
              </div>

              <form onSubmit={aiForm.handleSubmit(handleAiParse)} className="space-y-4">
                <textarea
                  rows={7}
                  placeholder="Paste what you ate... e.g. 2 eggs, toast, orange juice"
                  {...aiForm.register('text')}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
                />
                {aiForm.formState.errors.text ? (
                  <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
                    {aiForm.formState.errors.text.message}
                  </div>
                ) : null}
                <button
                  type="submit"
                  disabled={aiForm.formState.isSubmitting || parseMealMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3.5 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {aiForm.formState.isSubmitting || parseMealMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                  {aiForm.formState.isSubmitting || parseMealMutation.isPending ? 'Parsing Meal' : 'Parse with AI'}
                </button>
              </form>

              {aiError ? (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                  {aiError}
                </div>
              ) : null}

              {aiResult ? (
                <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0d0d0d] p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-medium text-[#f5f5f5]">Parsed meal</div>
                      <div className="text-xs text-[#777]">
                        {usedModel ? `Generated with ${usedModel}` : 'Generated with Gemini'}
                      </div>
                      {fallbackFrom ? (
                        <div className="mt-1 text-xs text-[#999]">
                          Retried with {usedModel} after {fallbackFrom} did not return usable JSON.
                        </div>
                      ) : null}
                    </div>
                    <div className="rounded-full border border-[#e4ff00]/30 bg-[#e4ff00]/10 px-3 py-1 text-xs uppercase tracking-wide text-[#e4ff00]">
                      {aiResult.mealType}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {aiResult.items.map((item, index) => (
                      <div
                        key={`${item.foodName}-${index}`}
                        className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-medium text-[#f5f5f5]">{item.foodName}</div>
                            <div className="mt-1 text-xs text-[#777]">
                              {item.quantity && item.unit
                                ? `${item.quantity} ${item.unit}`
                                : item.quantity
                                  ? `${item.quantity}`
                                  : 'Portion size estimated by AI'}
                            </div>
                          </div>
                          <div className="text-right text-sm text-[#f5f5f5]">
                            {Math.round(item.calories)} cal
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[#888]">
                          <div className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2">
                            Protein {item.proteinGrams}g
                          </div>
                          <div className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2">
                            Carbs {item.carbsGrams}g
                          </div>
                          <div className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2">
                            Fat {item.fatGrams}g
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
                    <div className="text-sm font-medium text-[#f5f5f5]">Was this estimate accurate?</div>
                    <div className="mt-1 text-xs text-[#777]">
                      This helps us understand whether the AI got the calories and macros roughly right.
                    </div>
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setAiFeedback('accurate')}
                        className={cn(
                          'rounded-full border px-4 py-2 text-sm transition-colors',
                          aiFeedback === 'accurate'
                            ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                            : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]',
                        )}
                      >
                        Looks accurate
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiFeedback('inaccurate')}
                        className={cn(
                          'rounded-full border px-4 py-2 text-sm transition-colors',
                          aiFeedback === 'inaccurate'
                            ? 'border-red-400 bg-red-500/10 text-red-200'
                            : 'border-white/10 bg-[#141414] text-[#888] hover:border-red-400/50 hover:text-red-200',
                        )}
                      >
                        Needs work
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void saveParsedMeal()}
                    disabled={createMealMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3.5 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {createMealMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="h-4 w-4" />
                    )}
                    {createMealMutation.isPending ? 'Saving Meal' : 'Save Parsed Meal'}
                  </button>
                </div>
              ) : (
                <EmptyState
                  title="Paste a meal and let Gemini structure it"
                  description="Nutrix will estimate calories and macros, then you can review and save the parsed meal into your history."
                />
              )}
            </div>
          ) : null}
        </div>
      </SectionCard>
    </div>
  )
}
