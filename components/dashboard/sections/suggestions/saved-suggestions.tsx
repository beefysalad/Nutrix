'use client'

import { BrainCircuit, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { EmptyState, SectionCard } from '@/components/dashboard/ui'
import {
  getApiErrorMessage,
  useSavedMealSuggestionsQuery,
  useSaveMealSuggestionMutation,
} from '@/hooks/dashboard'

import { RecipeDetailView } from './recipe-detail'
import { SuggestionCardButton } from './suggestion-card'

export function SavedSuggestionsSection() {
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
