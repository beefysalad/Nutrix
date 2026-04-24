'use client'

import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BrainCircuit,
  ChefHat,
  Clock,
  Loader2,
  Lock,
  SlidersHorizontal,
  Trash2,
  Target,
  X,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { SuggestionsSubview } from '@/components/dashboard/types'
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

const suggestionStyleOptions = [
  {
    id: 'quick',
    label: 'Quick',
    description: 'Fast meals and easy assemblies for busy days.',
  },
  {
    id: 'lutong-bahay',
    label: 'Lutong Bahay',
    description: 'Comforting home-style ideas that still fit your targets.',
  },
  {
    id: 'budget',
    label: 'Budget',
    description: 'Affordable combinations using practical ingredients.',
  },
  {
    id: 'high-protein',
    label: 'High Protein',
    description: 'Protein-forward ideas without making the meal feel plain.',
  },
] as const

const mealTypeOptions = [
  { id: 'any', label: 'Any meal' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
  { id: 'other', label: 'Other' },
] as const

type SuggestionStyle = (typeof suggestionStyleOptions)[number]['id']
type MealTypePreference = (typeof mealTypeOptions)[number]['id']
type SuggestionPayload = NonNullable<MealSuggestionResponse['payload']>
type SuggestionCard = SuggestionPayload['suggestions'][number]
type GoalMode = SuggestionPayload['basedOn']['goalMode']

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
  const [selectedMealType, setSelectedMealType] =
    useState<MealTypePreference>('any')
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<
    string | null
  >(null)

  const selectedMealTypeParam =
    selectedMealType === 'any' ? undefined : selectedMealType
  const suggestionsQuery = useMealSuggestionsQuery({
    style: selectedStyle,
    mealType: selectedMealTypeParam,
  })
  const generateSuggestionsMutation = useGenerateMealSuggestionsMutation()

  const usage = suggestionsQuery.data?.usage
  const payload = suggestionsQuery.data?.payload ?? null
  const suggestions = useMemo(
    () => payload?.suggestions ?? [],
    [payload?.suggestions]
  )

  const categories = useMemo(() => {
    const tags = Array.from(new Set(suggestions.flatMap((item) => item.tags)))
    return ['All', ...tags]
  }, [suggestions])

  const filteredSuggestions =
    activeCategory === 'All'
      ? suggestions
      : suggestions.filter((item) => item.tags.includes(activeCategory))

  const selectedSuggestion = useMemo(
    () => suggestions.find((item) => item.id === selectedSuggestionId) ?? null,
    [selectedSuggestionId, suggestions]
  )

  const activeStyleMeta =
    suggestionStyleOptions.find((option) => option.id === selectedStyle) ??
    suggestionStyleOptions[0]
  const canGenerate = (usage?.remainingToday ?? 0) > 0

  if (selectedSuggestion) {
    return (
      <RecipeDetailView
        suggestion={selectedSuggestion}
        suggestionStyle={selectedStyle}
        onBack={() => setSelectedSuggestionId(null)}
      />
    )
  }

  async function handleGenerateSuggestions() {
    try {
      await generateSuggestionsMutation.mutateAsync({
        style: selectedStyle,
        mealType: selectedMealTypeParam,
      })
      toast.success('Suggestions generated')
      setActiveCategory('All')
      setSelectedSuggestionId(null)
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Could not generate smart suggestions')
      )
    }
  }

  if (suggestionsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <SectionCard className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
        </SectionCard>
      </div>
    )
  }

  if (suggestionsQuery.isError) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <SectionCard>
          <EmptyState
            title="Suggestions could not be loaded"
            description="Nutrix hit an issue while loading your suggestion state. Try refreshing in a moment."
          />
        </SectionCard>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="mb-2 text-2xl text-[#f5f5f5]">Smart Suggestions</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-[#777]">
              Generate meal ideas from your goal, recent logs, and selected
              style.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsPreferencesOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-[#0a0a0a] px-4 py-2 text-sm text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-[#e4ff00]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Preferences
            </Button>
            <Link
              href="/dashboard/suggestions/saved"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-[#0a0a0a] px-4 py-2 text-sm text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-[#e4ff00]"
            >
              <BookmarkCheck className="h-4 w-4" />
              Saved ideas
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#101010] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-[#f5f5f5]">
              {activeStyleMeta.label} / {formatMealPreference(selectedMealType)}
            </div>
            <div className="mt-1 text-xs text-[#777]">
              {usage?.remainingToday ?? 0} left today
              {payload?.basedOn.goalMode ? ` / ${formatGoalMode(payload.basedOn.goalMode)}` : ''}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Button
              type="button"
              onClick={() => void handleGenerateSuggestions()}
              disabled={generateSuggestionsMutation.isPending || !canGenerate}
              className="flex items-center justify-center gap-2 rounded-full border border-[#e4ff00]/30 bg-[#e4ff00] px-4 py-2 text-sm font-bold text-[#0a0a0a] transition-colors hover:bg-[#efff4d] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-[#242424] disabled:text-[#777]"
            >
              {generateSuggestionsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : canGenerate ? (
                <BrainCircuit className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {canGenerate ? 'Generate Ideas' : 'Daily Limit Reached'}
            </Button>
            <div className="text-xs text-[#666]">
              Used {usage?.usedToday ?? 0} / {usage?.dailyLimit ?? 3}
            </div>
          </div>
        </div>

        {suggestions.length > 0 ? (
          <SectionCard>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg text-[#f5f5f5]">Current Ideas</h3>
                <p className="mt-1 text-sm text-[#777]">
                  Latest {activeStyleMeta.label.toLowerCase()} suggestions.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isActive = activeCategory === category

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
                        isActive
                          ? 'bg-[#e4ff00] text-[#0a0a0a]'
                          : 'border border-white/10 bg-[#0a0a0a] text-[#888] hover:border-[#e4ff00]/40 hover:text-[#e4ff00]'
                      )}
                    >
                      {category}
                    </button>
                  )
                })}
              </div>
            </div>

            {filteredSuggestions.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {filteredSuggestions.map((suggestion) => (
                  <SuggestionCardButton
                    key={suggestion.id}
                    suggestion={suggestion}
                    onOpen={() => setSelectedSuggestionId(suggestion.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No ideas match that tag"
                description="Switch back to All or generate a new batch."
              />
            )}
          </SectionCard>
        ) : (
          <SectionCard>
            <EmptyState
              title="No suggestions generated yet"
              description="Pick a style, then generate a batch when you want fresh meal ideas."
            />
          </SectionCard>
        )}
      </div>

      {isPreferencesOpen ? (
        <PreferencesModal
          selectedStyle={selectedStyle}
          selectedMealType={selectedMealType}
          onStyleChange={(value) => {
            setSelectedStyle(value)
            setActiveCategory('All')
            setSelectedSuggestionId(null)
          }}
          onMealTypeChange={(value) => {
            setSelectedMealType(value)
            setActiveCategory('All')
            setSelectedSuggestionId(null)
          }}
          onGenerate={() => {
            setIsPreferencesOpen(false)
            void handleGenerateSuggestions()
          }}
          canGenerate={canGenerate}
          isGenerating={generateSuggestionsMutation.isPending}
          remainingToday={usage?.remainingToday ?? 0}
          usedToday={usage?.usedToday ?? 0}
          dailyLimit={usage?.dailyLimit ?? 3}
          onClose={() => setIsPreferencesOpen(false)}
        />
      ) : null}
    </>
  )
}

function SavedSuggestionsSection() {
  const savedSuggestionsQuery = useSavedMealSuggestionsQuery()
  const saveSuggestionMutation = useSaveMealSuggestionMutation()
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<
    string | null
  >(null)
  const suggestions = savedSuggestionsQuery.data?.suggestions ?? []
  const selectedSuggestion =
    suggestions.find((suggestion) => suggestion.id === selectedSuggestionId) ??
    null

  async function handleRemoveSavedSuggestion(suggestionId: string) {
    try {
      await saveSuggestionMutation.mutateAsync({
        suggestionId,
        isSaved: false,
      })
      toast.success('Removed from saved ideas')
      if (selectedSuggestionId === suggestionId) {
        setSelectedSuggestionId(null)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not remove suggestion'))
    }
  }

  if (savedSuggestionsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <SectionCard className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
        </SectionCard>
      </div>
    )
  }

  if (savedSuggestionsQuery.isError) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <SectionCard>
          <EmptyState
            title="Saved ideas could not be loaded"
            description="Nutrix hit an issue while loading your saved suggestions. Try again in a moment."
          />
        </SectionCard>
      </div>
    )
  }

  if (selectedSuggestion) {
    return (
      <RecipeDetailView
        suggestion={selectedSuggestion}
        suggestionStyle={null}
        onBack={() => setSelectedSuggestionId(null)}
        onRemoved={() => setSelectedSuggestionId(null)}
      />
    )
  }

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="mb-2 text-2xl text-[#f5f5f5]">Saved Suggestions</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-[#777]">
              Ideas you saved for later.
            </p>
          </div>
          <Link
            href="/dashboard/suggestions"
            className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-white/10 bg-[#0a0a0a] px-4 py-2 text-sm text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-[#e4ff00]"
          >
            <BrainCircuit className="h-4 w-4" />
            Generate more
          </Link>
        </div>

        {suggestions.length > 0 ? (
          <SectionCard>
            <div className="grid gap-4 lg:grid-cols-3">
              {suggestions.map((suggestion) => (
                <SuggestionCardButton
                  key={suggestion.id}
                  suggestion={suggestion}
                  onOpen={() => setSelectedSuggestionId(suggestion.id)}
                  onRemove={() => void handleRemoveSavedSuggestion(suggestion.id)}
                  removePending={saveSuggestionMutation.isPending}
                  showRemove
                />
              ))}
            </div>
          </SectionCard>
        ) : (
          <SectionCard>
            <EmptyState
              title="No saved ideas yet"
              description="Save a suggestion and it will appear here."
            />
          </SectionCard>
        )}
      </div>

    </>
  )
}

function SuggestionCardButton({
  suggestion,
  onOpen,
  onRemove,
  removePending = false,
  showRemove = false,
}: {
  suggestion: SuggestionCard
  onOpen: () => void
  onRemove?: () => void
  removePending?: boolean
  showRemove?: boolean
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onOpen}
      className="group flex h-full min-h-[260px] w-full flex-col items-stretch justify-start whitespace-normal rounded-[1.35rem] border border-white/[0.08] bg-[#101010] p-4 text-left transition-colors hover:border-[#e4ff00]/25 hover:bg-[#131313]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[9px] font-black tracking-[0.18em] text-[#888] uppercase">
          {suggestion.difficulty}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-wider text-[#555] uppercase">
            {suggestion.prepTime}
          </span>
          {showRemove && onRemove ? (
            <span
              role="button"
              tabIndex={0}
              aria-label={`Remove ${suggestion.name} from saved suggestions`}
              onClick={(event) => {
                event.stopPropagation()
                onRemove()
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  event.stopPropagation()
                  onRemove()
                }
              }}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-black/20 text-[#555] transition-colors hover:border-red-500/30 hover:text-red-400',
                removePending && 'pointer-events-none opacity-60'
              )}
            >
              {removePending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 min-h-[86px]">
        <h3 className="line-clamp-2 text-base leading-snug font-semibold text-[#f1f1f1]">
          {suggestion.name}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#777]">
          {suggestion.description}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/[0.06] bg-black/20 p-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[9px] font-black tracking-[0.22em] text-[#555] uppercase">
              Calories
            </div>
            <div className="mt-1 font-mono text-xl font-black text-[#e4ff00]">
              {suggestion.calories}
              <span className="ml-1 text-[10px] tracking-wider text-[#6f7c00]">
                kcal
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-right">
            <MacroPill label="P" value={`${Math.round(suggestion.protein)}g`} />
            <MacroPill label="C" value={`${Math.round(suggestion.carbs)}g`} />
            <MacroPill label="F" value={`${Math.round(suggestion.fat)}g`} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {suggestion.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[9px] font-bold tracking-wide text-[#777] uppercase"
          >
            {tag}
          </span>
        ))}
      </div>
    </Button>
  )
}

function PreferenceSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: ReadonlyArray<{ id: string; label: string }>
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
      <label className="text-[10px] font-black tracking-[0.2em] text-[#666] uppercase">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 min-w-40 rounded-full border border-white/10 bg-[#0a0a0a] px-4 text-sm font-semibold text-[#f5f5f5] outline-none transition-colors hover:border-[#e4ff00]/40 focus:border-[#e4ff00]/70"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function PreferencesModal({
  selectedStyle,
  selectedMealType,
  onStyleChange,
  onMealTypeChange,
  onGenerate,
  canGenerate,
  isGenerating,
  remainingToday,
  usedToday,
  dailyLimit,
  onClose,
}: {
  selectedStyle: SuggestionStyle
  selectedMealType: MealTypePreference
  onStyleChange: (value: SuggestionStyle) => void
  onMealTypeChange: (value: MealTypePreference) => void
  onGenerate: () => void
  canGenerate: boolean
  isGenerating: boolean
  remainingToday: number
  usedToday: number
  dailyLimit: number
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/65 backdrop-blur-sm sm:items-center">
      <Button
        type="button"
        aria-label="Close preferences"
        variant="ghost"
        className="absolute inset-0 cursor-default hover:bg-transparent"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-t-[2rem] border border-white/10 bg-[#111111] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:rounded-[2rem] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-[#f5f5f5]">
              Select preferences
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[#777]">
              Set the style and meal before generating.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/10 bg-[#151515] text-[#999] transition-colors hover:bg-[#151515] hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <PreferenceSelect
            label="Style"
            value={selectedStyle}
            onChange={(value) => onStyleChange(value as SuggestionStyle)}
            options={suggestionStyleOptions}
          />
          <PreferenceSelect
            label="Meal"
            value={selectedMealType}
            onChange={(value) => onMealTypeChange(value as MealTypePreference)}
            options={mealTypeOptions}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-3 text-sm text-[#888]">
          {remainingToday} left today / Used {usedToday} of {dailyLimit}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-[#0a0a0a] px-4 py-2 text-sm text-[#888] transition-colors hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || !canGenerate}
            className="flex items-center justify-center gap-2 rounded-full border border-[#e4ff00]/30 bg-[#e4ff00] px-4 py-2 text-sm font-bold text-[#0a0a0a] transition-colors hover:bg-[#efff4d] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-[#242424] disabled:text-[#777]"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : canGenerate ? (
              <BrainCircuit className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {canGenerate ? 'Generate Ideas' : 'Daily Limit Reached'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function RecipeDetailView({
  suggestion,
  suggestionStyle,
  onRemoved,
  onBack,
}: {
  suggestion: SuggestionCard
  suggestionStyle: SuggestionStyle | null
  onRemoved?: () => void
  onBack: () => void
}) {
  const saveSuggestionMutation = useSaveMealSuggestionMutation()

  async function handleSaveSuggestion() {
    try {
      await saveSuggestionMutation.mutateAsync({
        suggestionId: suggestion.id,
        isSaved: !suggestion.isSaved,
      })
      toast.success(
        suggestion.isSaved ? 'Removed from saved ideas' : 'Suggestion saved'
      )
      if (suggestion.isSaved) {
        onRemoved?.()
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not save suggestion'))
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0a0a0a] px-4 py-2 text-sm text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-[#e4ff00]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-[#141414] px-2.5 py-1 text-[10px] font-black tracking-[0.2em] text-[#888] uppercase">
              {suggestion.difficulty}
            </span>
            <span className="rounded-full border border-white/10 bg-[#141414] px-2.5 py-1 text-[10px] font-black tracking-[0.2em] text-[#888] uppercase">
              {suggestion.prepTime}
            </span>
            {suggestionStyle ? (
              <span className="rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/10 px-2.5 py-1 text-[10px] font-black tracking-[0.2em] text-[#e4ff00] uppercase">
                {formatStyleLabel(suggestionStyle)}
              </span>
            ) : null}
          </div>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-[#f5f5f5]">
            {suggestion.name}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#888]">
            {suggestion.description}
          </p>
        </div>
        <div className="sm:pt-12">
          <Button
            type="button"
            onClick={() => void handleSaveSuggestion()}
            disabled={saveSuggestionMutation.isPending}
            className={cn(
              'flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
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
            {suggestion.isSaved ? 'Remove Saved Suggestion' : 'Save Suggestion'}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetaCard
          icon={<Clock className="h-4 w-4" />}
          label="Prep"
          value={suggestion.prepTime}
        />
        <MetaCard
          icon={<Target className="h-4 w-4" />}
          label="Calories"
          value={`${suggestion.calories}`}
        />
        <MetaCard
          icon={<ChefHat className="h-4 w-4" />}
          label="Protein"
          value={`${suggestion.protein}g`}
        />
        <MetaCard label="Carbs" value={`${suggestion.carbs}g`} />
        <MetaCard label="Fat" value={`${suggestion.fat}g`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard>
          <div className="text-[10px] font-black tracking-[0.2em] text-[#666] uppercase">
            Ingredients
          </div>
          {suggestion.ingredients.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {suggestion.ingredients.map((ingredient, index) => (
                <li
                  key={`${ingredient}-${index}`}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-3 text-sm leading-relaxed text-[#d7d7d7]"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e4ff00]" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#777]">
              This saved suggestion was created before recipe details were added.
              Generate a fresh batch to get ingredients.
            </p>
          )}
        </SectionCard>

        <SectionCard>
          <div className="text-[10px] font-black tracking-[0.2em] text-[#666] uppercase">
            Cooking Steps
          </div>
          {suggestion.instructions.length > 0 ? (
            <ol className="mt-4 space-y-3">
              {suggestion.instructions.map((step, index) => (
                <li
                  key={`${step}-${index}`}
                  className="grid grid-cols-[2rem_1fr] gap-3 rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-3 text-sm leading-relaxed text-[#d7d7d7]"
                >
                  <span className="font-mono text-sm font-black text-[#e4ff00]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-[#777]">
              This saved suggestion was created before recipe details were added.
              Generate a fresh batch to get cooking steps.
            </p>
          )}
        </SectionCard>
      </div>

      <SectionCard>
        <div className="text-[10px] font-black tracking-[0.2em] text-[#666] uppercase">
          Notes
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#d0d0d0]">
          {suggestion.cookingNotes || suggestion.reasoning}
        </p>
      </SectionCard>
    </div>
  )
}

function MacroPill({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[8px] font-black tracking-widest text-[#555] uppercase">
        {label}
      </div>
      <div className="mt-1 font-mono text-xs font-bold text-[#d7d7d7]">
        {value}
      </div>
    </div>
  )
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon?: ReactNode
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

function formatMealPreference(mealType: MealTypePreference) {
  return mealTypeOptions.find((option) => option.id === mealType)?.label ?? 'Any meal'
}

function formatGoalMode(goalMode: GoalMode | undefined) {
  switch (goalMode) {
    case 'cutting':
      return 'Cutting'
    case 'maintenance':
      return 'Maintenance'
    case 'bulking':
      return 'Bulking'
    case 'custom':
      return 'Custom'
    default:
      return 'Not set'
  }
}
