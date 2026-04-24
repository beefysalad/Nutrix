'use client'

import { BrainCircuit, Loader2, Lock, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { EmptyState, SectionCard, cn } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
import {
  getApiErrorMessage,
  useGenerateMealSuggestionsMutation,
  useMealSuggestionsQuery,
} from '@/lib/hooks/use-dashboard-api'

import { PreferencesModal } from './preferences-modal'
import { RecipeDetailView } from './recipe-detail'
import { SuggestionCardButton } from './suggestion-card'
import {
  formatGoalMode,
  formatMealPreference,
  suggestionStyleOptions,
  type MealTypePreference,
  type SuggestionStyle,
} from './types'

export function GenerateSuggestionsSection() {
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
              <BrainCircuit className="h-4 w-4" /> {/* Replacing BookmarkCheck to fix import since it's only in details usually, wait, bookmarkcheck used there? BrainCircuit is fine */}
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
