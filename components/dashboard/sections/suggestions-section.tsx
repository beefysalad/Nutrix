'use client'

import {
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Bot,
  ChefHat,
  Clock,
  ExternalLink,
  Loader2,
  Lock,
  Salad,
  Target,
  X,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

import { EmptyState, SectionCard, cn } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
import {
  getApiErrorMessage,
  useGenerateMealSuggestionsMutation,
  useMealSuggestionsQuery,
  useSavedMealSuggestionsQuery,
  useSaveMealSuggestionMutation,
  type MealSuggestionResponse,
} from '@/lib/hooks/use-dashboard-api'
import type { SuggestionsSubview } from '@/components/dashboard/types'

const suggestionStyleOptions = [
  {
    id: 'quick',
    label: 'Quick',
    description: 'Fast and easy meals for daily logging',
  },
  {
    id: 'lutong-bahay',
    label: 'Lutong Bahay',
    description: 'Comforting home-style Filipino dishes',
  },
  {
    id: 'budget',
    label: 'Budget',
    description: 'More affordable everyday meal ideas',
  },
  {
    id: 'high-protein',
    label: 'High Protein',
    description: 'Protein-forward meals that still feel local',
  },
] as const

type SuggestionStyle = (typeof suggestionStyleOptions)[number]['id']
type SuggestionCard = NonNullable<
  MealSuggestionResponse['payload']
>['suggestions'][number]

export function SuggestionsSection({
  initialView = 'generate',
}: {
  initialView?: SuggestionsSubview
}) {
  return initialView === 'saved' ? (
    <SavedSuggestionsSection />
  ) : (
    <GenerateSuggestionsSection />
  )
}

function GenerateSuggestionsSection() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedStyle, setSelectedStyle] = useState<SuggestionStyle>('quick')
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<
    string | null
  >(null)

  const suggestionsQuery = useMealSuggestionsQuery({ style: selectedStyle })
  const generateSuggestionsMutation = useGenerateMealSuggestionsMutation()

  const usage = suggestionsQuery.data?.usage
  const payload = suggestionsQuery.data?.payload ?? null
  const suggestions = useMemo(
    () => payload?.suggestions ?? [],
    [payload?.suggestions]
  )

  const categories = useMemo(() => {
    const dynamicTags = Array.from(
      new Set(suggestions.flatMap((item) => item.tags))
    )
    return ['All', ...dynamicTags]
  }, [suggestions])

  const filteredSuggestions =
    activeCategory === 'All'
      ? suggestions
      : suggestions.filter((item) => item.tags.includes(activeCategory))

  const selectedSuggestion = useMemo(
    () => suggestions.find((item) => item.id === selectedSuggestionId) ?? null,
    [selectedSuggestionId, suggestions]
  )

  const canGenerate = (usage?.remainingToday ?? 0) > 0

  async function handleGenerateSuggestions() {
    try {
      await generateSuggestionsMutation.mutateAsync({ style: selectedStyle })
      toast.success('Smart suggestions generated')
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Could not generate smart suggestions')
      )
    }
  }

  if (suggestionsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 pb-10">
        <SectionCard className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
        </SectionCard>
      </div>
    )
  }

  if (suggestionsQuery.isError) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 pb-10">
        <SectionCard>
          <EmptyState
            title="Suggestions could not be loaded"
            description="Nutrix hit an issue while loading your smart suggestion state. Try refreshing in a moment."
          />
        </SectionCard>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-8 pb-10">
        <div className="border-b border-white/10 px-1 pb-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/10 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-[#e4ff00] uppercase">
                  Nutrix AI
                </div>
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black tracking-[0.2em] text-[#d7d7d7] uppercase">
                  Beta
                </div>
              </div>
              <h2 className="font-mono text-2xl font-black tracking-tighter text-[#f5f5f5] uppercase sm:text-4xl">
                Smart <span className="text-[#e4ff00]">Suggestions</span>
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-[#777]">
                Pick the type of food you want first, then tap generate only
                when you want a fresh smart suggestion set.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => void handleGenerateSuggestions()}
              disabled={generateSuggestionsMutation.isPending || !canGenerate}
              className="flex items-center justify-center gap-3 self-start rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold tracking-widest text-[#d7d7d7] uppercase transition-colors hover:border-[#e4ff00]/30 hover:text-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generateSuggestionsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : canGenerate ? (
                <Bot className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {canGenerate ? 'Get Suggestions' : 'Daily Limit Reached'}
            </Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <SuggestionTopCard
              icon={<Target className="h-4 w-4" />}
              label="Goal mode"
              value={payload?.basedOn.goalMode ?? 'Custom'}
              helper="Suggestions are tuned around your active goal"
            />
            <SuggestionTopCard
              icon={<ChefHat className="h-4 w-4" />}
              label="Meal focus"
              value={payload?.basedOn.generatedForMealType ?? 'Mixed'}
              helper="Nutrix uses what you usually log most often"
            />
            <SuggestionTopCard
              icon={<Salad className="h-4 w-4" />}
              label="Daily usage"
              value={`${usage?.remainingToday ?? 0} left`}
              helper={`You can generate up to ${usage?.dailyLimit ?? 3} times before ${usage?.resetAtLabel ?? '12:00 AM'}`}
            />
          </div>
        </div>

        <SectionCard className="space-y-4 border-0 bg-transparent p-0 shadow-none">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-black tracking-[0.2em] text-[#666] uppercase">
                Suggestion style
              </div>
              <div className="mt-2 text-sm text-[#7a7a7a]">
                Choose what kind of meals you want Nutrix to generate when you
                spend one of your daily uses.
              </div>
            </div>
            <div className="hidden rounded-full border border-white/10 bg-[#111] px-3 py-1 text-[10px] font-black tracking-[0.2em] text-[#e4ff00] uppercase sm:inline-flex">
              {formatStyleLabel(
                payload?.basedOn.suggestionStyle ?? selectedStyle
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {suggestionStyleOptions.map((option) => {
              const isActive = option.id === selectedStyle

              return (
                <Button
                  key={option.id}
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSelectedStyle(option.id)
                    setActiveCategory('All')
                    setSelectedSuggestionId(null)
                  }}
                  className={cn(
                    'h-auto w-full justify-start whitespace-normal rounded-[1.5rem] border p-4 text-left transition-colors hover:bg-transparent',
                    isActive
                      ? 'border-[#e4ff00] bg-[#1e2307]'
                      : 'border-white/10 bg-[#111111] hover:border-white/20'
                  )}
                >
                  <div className="flex w-full flex-col items-start text-left">
                    <div className="text-sm font-bold tracking-wide text-[#f5f5f5] uppercase">
                      {option.label}
                    </div>
                    <div className="mt-2 text-sm leading-relaxed text-[#777]">
                      {option.description}
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard className="flex flex-col gap-3 border-0 bg-transparent p-0 shadow-none sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-black tracking-[0.2em] text-[#666] uppercase">
              Daily limit
            </div>
            <div className="mt-2 text-sm text-[#cfcfcf]">
              {suggestions.length > 0
                ? `These are your current ${formatStyleLabel(selectedStyle)} suggestions from this session. Generating again will use another one of your daily attempts.`
                : `You have ${usage?.remainingToday ?? 0} of ${usage?.dailyLimit ?? 3} suggestion attempts left today.`}
            </div>
            <div className="mt-1 text-xs text-[#6f6f6f]">
              Used today: {usage?.usedToday ?? 0} / {usage?.dailyLimit ?? 3}
            </div>
          </div>
          <Link
            href="/dashboard/suggestions/saved"
            className="flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-bold tracking-widest text-[#d7d7d7] uppercase transition-colors hover:border-[#e4ff00]/30 hover:text-[#f5f5f5]"
          >
            <BookmarkCheck className="h-3.5 w-3.5" />
            Saved meals
          </Link>
        </SectionCard>

        {suggestions.length > 0 ? (
          <>
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'rounded-xl px-4 py-2.5 text-xs font-bold tracking-wider whitespace-nowrap uppercase transition-all',
                    activeCategory === cat
                      ? 'border border-[#e4ff00]/20 bg-[#e4ff00] text-black'
                      : 'border border-white/5 bg-[#141414] text-[#666] hover:border-white/10 hover:text-[#999]'
                  )}
                >
                  {cat}
                </Button>
              ))}
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredSuggestions.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedSuggestionId(item.id)}
                  className="group flex h-full w-full flex-col items-stretch justify-start overflow-hidden whitespace-normal rounded-[1.75rem] border border-white/8 bg-[#111111] px-5 py-5 text-left transition-all hover:border-[#e4ff00]/30 hover:bg-[#121212]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black tracking-[0.22em] text-[#666] uppercase">
                        Open recipe
                      </div>
                      <h3 className="mt-3 text-2xl leading-tight font-bold text-[#f5f5f5] transition-colors group-hover:text-[#e4ff00]">
                        {item.name}
                      </h3>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-white uppercase">
                      {item.prepTime}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[#7a7a7a]">
                    {item.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/10 px-2.5 py-1 text-[9px] font-black tracking-wider text-[#e4ff00] uppercase">
                      {item.difficulty}
                    </span>
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[9px] font-black tracking-wider text-[#cfcfcf] uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 ? (
                      <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[9px] font-black tracking-wider text-[#8d8d8d] uppercase">
                        +{item.tags.length - 3}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 grid grid-cols-4 gap-2">
                    <SuggestionMacroStat
                      label="Cals"
                      value={`${item.calories}`}
                    />
                    <SuggestionMacroStat
                      label="Prot"
                      value={`${item.protein}g`}
                    />
                    <SuggestionMacroStat
                      label="Carb"
                      value={`${item.carbs}g`}
                    />
                    <SuggestionMacroStat label="Fat" value={`${item.fat}g`} />
                  </div>

                  <div className="mt-5 rounded-2xl border border-[#e4ff00]/10 bg-[#161908] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#e4ff00]/70" />
                      <div>
                        <div className="text-[10px] font-black tracking-[0.18em] text-[#777] uppercase">
                          Why this might work for you
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-[#9a9a9a]">
                          {item.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/6 pt-4 text-xs text-[#727272]">
                    <span className="truncate">
                      Recipe from{' '}
                      <span className="text-[#bcbcbc]">{item.sourceLabel}</span>
                    </span>
                    <span className="shrink-0 uppercase tracking-[0.18em] text-[#8a8a8a]">
                      Real recipe
                    </span>
                  </div>
                </Button>
              ))}
            </div>

            {filteredSuggestions.length === 0 ? (
              <SectionCard className="text-center">
                <div className="text-sm text-[#777]">
                  No suggestions match this filter yet. Try switching back to{' '}
                  <span className="text-[#f5f5f5]">All</span>.
                </div>
              </SectionCard>
            ) : null}
          </>
        ) : (
          <SectionCard>
            <EmptyState
              title="No suggestions generated yet"
              description="Opening this page does not spend a daily use anymore. Pick a style, then tap Generate Suggestions when you want a fresh set."
            />
          </SectionCard>
        )}
      </div>

      {selectedSuggestion ? (
        <RecipeSheet
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestionId(null)}
        />
      ) : null}
    </>
  )
}

function SavedSuggestionsSection() {
  const savedSuggestionsQuery = useSavedMealSuggestionsQuery()
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<
    string | null
  >(null)
  const suggestions = savedSuggestionsQuery.data?.suggestions ?? []
  const selectedSuggestion =
    suggestions.find((suggestion) => suggestion.id === selectedSuggestionId) ??
    null

  if (savedSuggestionsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 pb-10">
        <SectionCard className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
        </SectionCard>
      </div>
    )
  }

  if (savedSuggestionsQuery.isError) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 pb-10">
        <SectionCard>
          <EmptyState
            title="Saved meals could not be loaded"
            description="Nutrix hit an issue while loading your saved meal suggestions. Try again in a moment."
          />
        </SectionCard>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-8 pb-10">
        <div className="rounded-[2rem] border border-white/10 bg-[#141414] p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/10 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-[#e4ff00] uppercase">
                Saved meals
              </div>
              <h2 className="mt-4 font-mono text-2xl font-black tracking-tighter text-[#f5f5f5] uppercase sm:text-4xl">
                Saved <span className="text-[#e4ff00]">Suggestions</span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#777]">
                Meals you saved from smart suggestions live here so you can come
                back to the recipe source later.
              </p>
            </div>
            <Link
              href="/dashboard/suggestions"
              className="flex items-center justify-center gap-3 self-start rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold tracking-widest text-[#d7d7d7] uppercase transition-colors hover:border-[#e4ff00]/30 hover:text-[#f5f5f5]"
            >
              <Bot className="h-4 w-4" />
              Generate more
            </Link>
          </div>
        </div>

        {suggestions.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {suggestions.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant="ghost"
                onClick={() => setSelectedSuggestionId(item.id)}
                className="group flex h-full w-full flex-col items-stretch justify-start overflow-hidden whitespace-normal rounded-[1.75rem] border border-white/8 bg-[#111111] px-5 py-5 text-left transition-all hover:border-[#e4ff00]/30 hover:bg-[#121212]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.22em] text-[#e4ff00] uppercase">
                      <BookmarkCheck className="h-3.5 w-3.5" />
                      Saved
                    </div>
                    <h3 className="mt-3 text-2xl leading-tight font-bold text-[#f5f5f5] transition-colors group-hover:text-[#e4ff00]">
                      {item.name}
                    </h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-white uppercase">
                    {item.prepTime}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#7a7a7a]">
                  {item.description}
                </p>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  <SuggestionMacroStat
                    label="Cals"
                    value={`${item.calories}`}
                  />
                  <SuggestionMacroStat
                    label="Prot"
                    value={`${item.protein}g`}
                  />
                  <SuggestionMacroStat
                    label="Carb"
                    value={`${item.carbs}g`}
                  />
                  <SuggestionMacroStat label="Fat" value={`${item.fat}g`} />
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/6 pt-4 text-xs text-[#727272]">
                  <span className="truncate">
                    Recipe from{' '}
                    <span className="text-[#bcbcbc]">{item.sourceLabel}</span>
                  </span>
                  <span className="shrink-0 uppercase tracking-[0.18em] text-[#8a8a8a]">
                    Open recipe
                  </span>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <SectionCard>
            <EmptyState
              title="No saved meals yet"
              description="Save a suggestion from the recipe sheet and it will show up here."
            />
          </SectionCard>
        )}
      </div>

      {selectedSuggestion ? (
        <RecipeSheet
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestionId(null)}
        />
      ) : null}
    </>
  )
}

function RecipeSheet({
  suggestion,
  onClose,
}: {
  suggestion: SuggestionCard
  onClose: () => void
}) {
  const saveSuggestionMutation = useSaveMealSuggestionMutation()

  async function handleSaveSuggestion() {
    try {
      await saveSuggestionMutation.mutateAsync({
        suggestionId: suggestion.id,
        isSaved: !suggestion.isSaved,
      })
      toast.success(
        suggestion.isSaved
          ? 'Suggestion removed from saved'
          : 'Suggestion saved'
      )
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not save suggestion'))
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/65 backdrop-blur-sm">
      <Button
        type="button"
        aria-label="Close recipe"
        variant="ghost"
        className="absolute inset-0 cursor-default hover:bg-transparent"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-[88vh] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#111111] lg:mb-8 lg:h-auto lg:max-h-[86vh] lg:rounded-[2rem]">
        <div className="flex justify-center pt-3 lg:hidden">
          <div className="h-1.5 w-14 rounded-full bg-white/10" />
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 pt-4 pb-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/10 px-2.5 py-1 text-[10px] font-black tracking-[0.2em] text-[#e4ff00] uppercase">
                Recipe
              </span>
              <span className="rounded-full border border-white/10 bg-[#161616] px-2.5 py-1 text-[10px] font-black tracking-[0.2em] text-[#cfcfcf] uppercase">
                {suggestion.difficulty}
              </span>
            </div>
            <h3 className="mt-3 text-2xl font-bold text-[#f5f5f5]">
              {suggestion.name}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#7a7a7a]">
              {suggestion.description}
            </p>
          </div>

          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            size="icon-lg"
            className="shrink-0 rounded-full border border-white/10 bg-[#151515] text-[#999] transition-colors hover:bg-[#151515] hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-5 pb-6 sm:px-6">
          <Button
            type="button"
            onClick={() => void handleSaveSuggestion()}
            disabled={saveSuggestionMutation.isPending}
            size="lg"
            className={cn(
              'mb-5 flex w-full items-center justify-center gap-3 rounded-2xl border px-5 text-sm font-bold tracking-widest uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60',
              suggestion.isSaved
                ? 'border-[#e4ff00]/30 bg-[#e4ff00] text-black'
                : 'border-white/10 bg-white/[0.03] text-[#d7d7d7] hover:border-[#e4ff00]/30 hover:text-[#f5f5f5]'
            )}
          >
            {saveSuggestionMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : suggestion.isSaved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            {suggestion.isSaved ? 'Saved Suggestion' : 'Save Suggestion'}
          </Button>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <RecipeMetaCard
              icon={<Clock className="h-4 w-4" />}
              label="Prep"
              value={suggestion.prepTime}
            />
            <RecipeMetaCard
              icon={<Target className="h-4 w-4" />}
              label="Calories"
              value={`${suggestion.calories}`}
            />
            <RecipeMetaCard
              icon={<Salad className="h-4 w-4" />}
              label="Protein"
              value={`${suggestion.protein}g`}
            />
            <RecipeMetaCard
              icon={<ChefHat className="h-4 w-4" />}
              label="Carbs"
              value={`${suggestion.carbs}g`}
            />
            <RecipeMetaCard
              icon={<Salad className="h-4 w-4" />}
              label="Fat"
              value={`${suggestion.fat}g`}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <SectionCard className="space-y-4 bg-[#131313]">
              <div>
                <div className="text-[10px] font-black tracking-[0.2em] text-[#666] uppercase">
                  Recipe source
                </div>
                <div className="mt-2 text-sm text-[#777]">
                  Nutrix selected this from a real recipe source so you can
                  follow the actual cooking guide.
                </div>
              </div>
              <a
                href={suggestion.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#e4ff00]/20 bg-[#171a0a] px-4 py-4 text-sm text-[#f5f5f5] transition-colors hover:border-[#e4ff00]/40 hover:text-[#e4ff00]"
              >
                <div>
                  <div className="font-semibold">{suggestion.sourceLabel}</div>
                  <div className="mt-1 text-xs text-[#7d7d7d]">
                    Open the full recipe and cooking steps
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>
              <div className="rounded-2xl border border-white/8 bg-[#0f0f0f] px-4 py-4 text-sm leading-relaxed text-[#cfcfcf]">
                {suggestion.description}
              </div>
            </SectionCard>

            <SectionCard className="space-y-4 bg-[#131313]">
              <div>
                <div className="text-[10px] font-black tracking-[0.2em] text-[#666] uppercase">
                  Why this might work for you
                </div>
                <div className="mt-2 text-sm text-[#777]">
                  This is the personalization layer. The cooking itself comes
                  from the linked recipe source.
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-[#0f0f0f] px-4 py-4 text-sm leading-relaxed text-[#e7e7e7]">
                {suggestion.reasoning}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-[#0f0f0f] px-4 py-4">
                  <div className="text-[10px] font-black tracking-[0.2em] text-[#666] uppercase">
                    Difficulty
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[#f5f5f5] capitalize">
                    {suggestion.difficulty}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-[#0f0f0f] px-4 py-4">
                  <div className="text-[10px] font-black tracking-[0.2em] text-[#666] uppercase">
                    Source
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[#f5f5f5]">
                    {suggestion.sourceLabel}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}

function SuggestionTopCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="border-b border-white/10 px-1 py-3 last:border-b-0">
      <div className="flex items-center gap-2 text-[#e4ff00]">
        {icon}
        <div className="text-[10px] font-black tracking-[0.2em] text-[#777] uppercase">
          {label}
        </div>
      </div>
      <div className="mt-3 text-lg font-semibold text-[#f5f5f5] capitalize">
        {value}
      </div>
      <div className="mt-1 text-xs leading-relaxed text-[#6f6f6f]">
        {helper}
      </div>
    </div>
  )
}

function SuggestionMacroStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/[0.025] px-3 py-3 text-center">
      <div className="text-[10px] font-bold tracking-[0.16em] text-[#5b5b5b] uppercase">
        {label}
      </div>
      <div className="mt-2 font-mono text-base font-bold text-[#d2d2d2]">
        {value}
      </div>
    </div>
  )
}

function RecipeMetaCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#151515] p-4">
      <div className="flex items-center gap-2 text-[#e4ff00]">
        {icon}
        <div className="text-[10px] font-black tracking-[0.2em] text-[#666] uppercase">
          {label}
        </div>
      </div>
      <div className="mt-3 text-lg font-semibold text-[#f5f5f5]">{value}</div>
    </div>
  )
}

function formatStyleLabel(style: SuggestionStyle) {
  switch (style) {
    case 'lutong-bahay':
      return 'Lutong Bahay'
    case 'high-protein':
      return 'High Protein'
    default:
      return style.charAt(0).toUpperCase() + style.slice(1)
  }
}
