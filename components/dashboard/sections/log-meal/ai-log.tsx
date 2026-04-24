'use client'

import { Bot, Loader2, PlusCircle } from 'lucide-react'
import { type useForm } from 'react-hook-form'

import { EmptyState } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
import {
  type ParsedMeal,
  type useCreateMealMutation,
  type useParseMealMutation,
} from '@/lib/hooks/use-dashboard-api'
import { type AiMealParseFormValues } from '@/lib/validations/dashboard-forms'

import { formatMealType, type AiFeedback, type AiModel, type MealType } from './types'

function MacroChip({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2">
      {label} {value ?? 0}g
    </div>
  )
}

function ParsedMealReview({
  aiResult,
  usedModel,
  fallbackFrom,
  aiFeedback,
  setAiFeedback,
  selectedMealTag,
  createMealMutation,
  saveParsedMeal,
}: {
  aiResult: ParsedMeal
  usedModel: string | null
  fallbackFrom: string | null
  aiFeedback: AiFeedback
  setAiFeedback: (value: AiFeedback) => void
  selectedMealTag: MealType
  createMealMutation: ReturnType<typeof useCreateMealMutation>
  saveParsedMeal: () => Promise<void>
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0d0d0d] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium text-[#f5f5f5]">Review before saving</div>
          <div className="text-xs text-[#777]">
            {usedModel ? `Generated with ${usedModel}` : 'Generated from your meal text'}
          </div>
          {fallbackFrom ? (
            <div className="mt-1 text-xs text-[#999]">
              Retried after {fallbackFrom} returned an unusable response.
            </div>
          ) : null}
        </div>
        <div className="rounded-full border border-[#e4ff00]/30 bg-[#e4ff00]/10 px-3 py-1 text-xs uppercase tracking-wide text-[#e4ff00]">
          {formatMealType(aiResult.mealType ?? selectedMealTag)}
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
                      : 'Portion estimated'}
                </div>
              </div>
              <div className="text-right text-sm text-[#f5f5f5]">
                {Math.round(item.calories)} cal
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[#888]">
              <MacroChip label="Protein" value={item.proteinGrams} />
              <MacroChip label="Carbs" value={item.carbsGrams} />
              <MacroChip label="Fat" value={item.fatGrams} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium text-[#f5f5f5]">Estimate quality</div>
          <div className="mt-1 text-xs text-[#777]">Optional, but useful when the AI misses.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={aiFeedback === 'accurate' ? 'default' : 'outline'}
            onClick={() => setAiFeedback('accurate')}
            className="rounded-full"
          >
            Looks right
          </Button>
          <Button
            type="button"
            variant={aiFeedback === 'inaccurate' ? 'destructive' : 'outline'}
            onClick={() => setAiFeedback('inaccurate')}
            className="rounded-full"
          >
            Needs edit
          </Button>
        </div>
      </div>

      <Button
        type="button"
        onClick={() => void saveParsedMeal()}
        disabled={createMealMutation.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-full"
      >
        {createMealMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PlusCircle className="h-4 w-4" />
        )}
        {createMealMutation.isPending ? 'Saving' : 'Save meal'}
      </Button>
    </div>
  )
}

export function QuickAiLog({
  aiForm,
  aiError,
  aiResult,
  usedModel,
  fallbackFrom,
  aiFeedback,
  setAiFeedback,
  selectedMealTag,
  resolvedPreferredModel,
  parseMealMutation,
  createMealMutation,
  handleAiParse,
  saveParsedMeal,
}: {
  aiForm: ReturnType<typeof useForm<AiMealParseFormValues>>
  aiError: string | null
  aiResult: ParsedMeal | null
  usedModel: string | null
  fallbackFrom: string | null
  aiFeedback: AiFeedback
  setAiFeedback: (value: AiFeedback) => void
  selectedMealTag: MealType
  resolvedPreferredModel: AiModel
  parseMealMutation: ReturnType<typeof useParseMealMutation>
  createMealMutation: ReturnType<typeof useCreateMealMutation>
  handleAiParse: (values: AiMealParseFormValues) => Promise<void>
  saveParsedMeal: () => Promise<void>
}) {
  const isParsing = aiForm.formState.isSubmitting || parseMealMutation.isPending

  return (
    <div className="space-y-4">
      <form onSubmit={aiForm.handleSubmit(handleAiParse)} className="space-y-3">
        <textarea
          rows={6}
          placeholder="Type what you ate..."
          {...aiForm.register('text')}
          className="w-full resize-none rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-[#777]">
            Using{' '}
            {resolvedPreferredModel === 'gemini-2.5-flash'
              ? 'Gemini 2.5 Flash'
              : 'Gemini 2.5 Flash-Lite'}
          </div>
          <Button
            type="submit"
            disabled={isParsing}
            className="flex items-center justify-center gap-2 rounded-full"
          >
            {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            {isParsing ? 'Parsing' : 'Parse meal'}
          </Button>
        </div>

        {aiForm.formState.errors.text ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
            {aiForm.formState.errors.text.message}
          </div>
        ) : null}
      </form>

      {aiError ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {aiError}
        </div>
      ) : null}

      {aiResult ? (
        <ParsedMealReview
          aiResult={aiResult}
          usedModel={usedModel}
          fallbackFrom={fallbackFrom}
          aiFeedback={aiFeedback}
          setAiFeedback={setAiFeedback}
          selectedMealTag={selectedMealTag}
          createMealMutation={createMealMutation}
          saveParsedMeal={saveParsedMeal}
        />
      ) : (
        <EmptyState
          title="No parsed meal yet"
          description="Paste a meal above and Nutrix will turn it into food items you can review before saving."
        />
      )}
    </div>
  )
}
