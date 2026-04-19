'use client'

import { useEffect, useState } from 'react'
import { Loader2, PlusCircle, Search, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState, SectionCard, cn } from '@/components/dashboard/ui'

type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other'
type AiModel = 'gemini-2.5-flash-lite' | 'gemini-2.5-flash'

type ParsedMeal = {
  mealType: MealType
  notes?: string | null
  items: Array<{
    foodName: string
    quantity?: number | null
    unit?: string | null
    calories: number
    proteinGrams?: number | null
    carbsGrams?: number | null
    fatGrams?: number | null
  }>
}

export function LogMealSection() {
  const [activeTab, setActiveTab] = useState<'search' | 'custom' | 'ai'>('search')
  const [selectedMealTag, setSelectedMealTag] = useState<MealType>('breakfast')
  const [aiText, setAiText] = useState('')
  const [aiResult, setAiResult] = useState<ParsedMeal | null>(null)
  const [preferredModel, setPreferredModel] = useState<AiModel>('gemini-2.5-flash-lite')
  const [usedModel, setUsedModel] = useState<string | null>(null)
  const [fallbackFrom, setFallbackFrom] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isSavingParsedMeal, setIsSavingParsedMeal] = useState(false)
  const tabs = [
    { id: 'search', label: 'Search', description: 'Look up foods', icon: Search },
    { id: 'custom', label: 'Custom', description: 'Add manually', icon: PlusCircle },
    { id: 'ai', label: 'AI Parse', description: 'Paste meal text', icon: Sparkles },
  ] as const

  useEffect(() => {
    let cancelled = false

    async function loadPreferredModel() {
      try {
        const response = await fetch('/api/settings/preferences', {
          credentials: 'include',
        })

        if (!response.ok) {
          return
        }

        const data = (await response.json()) as {
          preferences?: {
            aiModel?: AiModel
          }
        }

        if (!cancelled && data.preferences?.aiModel) {
          setPreferredModel(data.preferences.aiModel)
        }
      } catch {
        // Keep the default model label if preferences are unavailable.
      }
    }

    void loadPreferredModel()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleAiParse() {
    if (!aiText.trim()) {
      toast.error('Add a meal description first')
      return
    }

    setIsParsing(true)
    setAiError(null)
    setAiResult(null)
    setFallbackFrom(null)

    try {
      const response = await fetch('/api/ai/parse-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text: aiText,
          mealType: selectedMealTag,
        }),
      })

      const data = (await response.json()) as {
        error?: string
        details?: string
        model?: string
        fallbackFrom?: string
        parsed?: ParsedMeal
      }

      if (!response.ok || !data.parsed) {
        throw new Error(data.details ?? data.error ?? 'Unable to parse meal')
      }

      setAiResult(data.parsed)
      setUsedModel(data.model ?? null)
      setFallbackFrom(data.fallbackFrom ?? null)
      toast.success('Meal parsed with Gemini')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to parse meal'
      setAiError(message)
      toast.error(message)
    } finally {
      setIsParsing(false)
    }
  }

  async function saveParsedMeal() {
    if (!aiResult) {
      return
    }

    setIsSavingParsedMeal(true)

    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mealType: aiResult.mealType ?? selectedMealTag,
          source: 'ai',
          notes: aiResult.notes ?? aiText,
          items: aiResult.items.map((item) => ({
            foodName: item.foodName,
            quantity: item.quantity ?? undefined,
            unit: item.unit ?? undefined,
            calories: Math.round(item.calories),
            proteinGrams: item.proteinGrams ?? undefined,
            carbsGrams: item.carbsGrams ?? undefined,
            fatGrams: item.fatGrams ?? undefined,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Unable to save parsed meal')
      }

      toast.success('Meal saved')
      setAiText('')
      setAiResult(null)
      setAiError(null)
      setFallbackFrom(null)
      setUsedModel(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save parsed meal')
    } finally {
      setIsSavingParsedMeal(false)
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
          {['breakfast', 'lunch', 'snack', 'dinner'].map((tag) => (
          <button
            key={tag}
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
                onClick={() => setActiveTab(tab.id as 'search' | 'custom' | 'ai')}
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
                description="The hardcoded search results are gone. Once we add a food repository or external food API, search results can feed real MealItem records."
              />
            </div>
          ) : null}

          {activeTab === 'custom' ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-4">
                <div className="mb-1 text-sm font-medium text-[#f5f5f5]">Manual entry</div>
                <div className="text-xs text-[#777]">
                  Good for custom foods, recipes, or quick nutrition snapshots while the database is still minimal.
                </div>
              </div>
              <input
                type="text"
                placeholder="Food name"
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
              />
              <div className="grid gap-4 md:grid-cols-2">
                {['Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)'].map((field) => (
                  <input
                    key={field}
                    type="number"
                    placeholder={field}
                    className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 font-mono text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
                  />
                ))}
              </div>
              <input
                type="text"
                placeholder="Serving size"
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
              />
              <button className="w-full rounded-2xl bg-[#e4ff00] px-4 py-3.5 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d]">
                Add Custom Food
              </button>
            </div>
          ) : null}

          {activeTab === 'ai' ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-4">
                <div className="mb-1 text-sm font-medium text-[#f5f5f5]">AI meal parse</div>
                <div className="text-xs text-[#777]">
                  Paste a natural sentence like “chicken rice and iced coffee” and let AI structure it into meal items.
                </div>
                <div className="mt-3 inline-flex rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/10 px-3 py-1 text-[11px] uppercase tracking-wide text-[#e4ff00]">
                  Using {preferredModel === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' : 'Gemini 2.5 Flash-Lite'}
                </div>
              </div>
              <textarea
                rows={7}
                placeholder="Paste what you ate... e.g. 2 eggs, toast, orange juice"
                value={aiText}
                onChange={(event) => setAiText(event.target.value)}
                className="w-full resize-none rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
              />
              <button
                onClick={() => void handleAiParse()}
                disabled={isParsing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3.5 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isParsing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isParsing ? 'Parsing Meal' : 'Parse with AI'}
              </button>
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
                            <div className="text-sm font-medium text-[#f5f5f5]">
                              {item.foodName}
                            </div>
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
                            Protein {item.proteinGrams ?? 0}g
                          </div>
                          <div className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2">
                            Carbs {item.carbsGrams ?? 0}g
                          </div>
                          <div className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2">
                            Fat {item.fatGrams ?? 0}g
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => void saveParsedMeal()}
                    disabled={isSavingParsedMeal}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3.5 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingParsedMeal ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="h-4 w-4" />
                    )}
                    {isSavingParsedMeal ? 'Saving Meal' : 'Save Parsed Meal'}
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
