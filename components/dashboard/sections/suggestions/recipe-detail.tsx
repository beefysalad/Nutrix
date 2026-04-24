import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChefHat,
  Clock,
  Loader2,
  Target,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

import { cn, SectionCard } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
import {
  getApiErrorMessage,
  useSaveMealSuggestionMutation,
} from '@/hooks/dashboard'

import { formatStyleLabel, type SuggestionCard, type SuggestionStyle } from './types'

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

export function RecipeDetailView({
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
