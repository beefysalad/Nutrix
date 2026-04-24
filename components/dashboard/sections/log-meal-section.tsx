'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, ChevronLeft, PencilLine, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { SectionCard, cn } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
import {
  getApiErrorMessage,
  useCreateMealMutation,
  useParseMealMutation,
  usePreferencesQuery,
  type ParsedMeal,
} from '@/hooks/dashboard'
import {
  aiMealParseFormSchema,
  manualMealFormSchema,
  type AiMealParseFormValues,
  type ManualMealFormInput,
  type ManualMealFormValues,
} from '@/lib/validations/dashboard-forms'

import { QuickAiLog } from './log-meal/ai-log'
import { LogModeChoice } from './log-meal/log-mode-choice'
import { ManualMealForm } from './log-meal/manual-meal-form'
import { MealTypeSelect } from './log-meal/meal-type-select'
import {
  getDefaultMealTypeForCurrentTime,
  type AiFeedback,
  type AiModel,
  type MealType,
  type SheetLogMode,
} from './log-meal/types'

export function LogMealSection({
  presentation = 'page',
  onClose,
}: {
  presentation?: 'page' | 'sheet'
  onClose?: () => void
}) {
  const [selectedMealTag, setSelectedMealTag] = useState<MealType>(getDefaultMealTypeForCurrentTime)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [sheetLogMode, setSheetLogMode] = useState<SheetLogMode>(null)
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
  const isSheetPresentation = presentation === 'sheet'

  function closeLoggingSurface() {
    onClose?.()
  }

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
      toast.success('Meal parsed')
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
      closeLoggingSurface()
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
              values.fatGrams && !Number.isNaN(values.fatGrams) ? values.fatGrams : undefined,
          },
        ],
      })

      toast.success('Meal saved')
      manualForm.reset({
        foodName: '',
        calories: undefined,
        proteinGrams: undefined,
        carbsGrams: undefined,
        fatGrams: undefined,
        servingSize: '',
      })
      closeLoggingSurface()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save meal'))
    }
  }

  if (isSheetPresentation) {
    return (
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {sheetLogMode ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setSheetLogMode(null)}
                className="mt-0.5 rounded-full border border-white/10 bg-[#141414] text-[#888]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : null}

            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#666]">
                Meal log
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-[#f5f5f5]">
                {sheetLogMode === 'ai'
                  ? 'Log with AI'
                  : sheetLogMode === 'manual'
                    ? 'Log manually'
                    : 'How do you want to log?'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#888]">
                {sheetLogMode === 'ai'
                  ? 'Type what you ate and review the estimate before saving.'
                  : sheetLogMode === 'manual'
                    ? 'Enter the meal details directly when you already know the numbers.'
                    : 'Start with AI for plain-language logging, or use manual when you have exact macros.'}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-[#141414] text-[#888]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {sheetLogMode ? (
          <SectionCard className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold text-[#f5f5f5]">
                  {sheetLogMode === 'ai' ? (
                    <Bot className="h-5 w-5 text-[#e4ff00]" />
                  ) : (
                    <PencilLine className="h-5 w-5 text-[#888]" />
                  )}
                  {sheetLogMode === 'ai' ? 'AI log' : 'Manual entry'}
                </div>
                <p className="mt-1 max-w-xl text-sm leading-6 text-[#888]">
                  {sheetLogMode === 'ai'
                    ? 'Example: “2 eggs, rice, chicken adobo, coke zero”.'
                    : 'Use this for custom foods, packaged meals, or known macro totals.'}
                </p>
              </div>

              <MealTypeSelect value={selectedMealTag} onChange={setSelectedMealTag} />
            </div>

            {sheetLogMode === 'ai' ? (
              <QuickAiLog
                aiForm={aiForm}
                aiError={aiError}
                aiResult={aiResult}
                usedModel={usedModel}
                fallbackFrom={fallbackFrom}
                aiFeedback={aiFeedback}
                setAiFeedback={setAiFeedback}
                selectedMealTag={selectedMealTag}
                resolvedPreferredModel={resolvedPreferredModel}
                parseMealMutation={parseMealMutation}
                createMealMutation={createMealMutation}
                handleAiParse={handleAiParse}
                saveParsedMeal={saveParsedMeal}
              />
            ) : (
              <ManualMealForm
                manualForm={manualForm}
                createMealMutation={createMealMutation}
                handleManualSubmit={handleManualSubmit}
              />
            )}
          </SectionCard>
        ) : (
          <LogModeChoice onSelect={setSheetLogMode} />
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'space-y-5',
        'mx-auto max-w-4xl px-0 md:px-2',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-[#666]">
            Meal log
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-[#f5f5f5] md:text-3xl">
            What did you eat?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#888]">
            Type it naturally, check the estimate, save it. Manual entry is still here when
            you already know the numbers.
          </p>
        </div>

      </div>

      <SectionCard className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-[#f5f5f5]">
              <Bot className="h-5 w-5 text-[#e4ff00]" />
              Quick log
            </div>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#888]">
              Example: “2 boiled eggs, rice, chicken adobo, coke zero”.
            </p>
          </div>

          <MealTypeSelect value={selectedMealTag} onChange={setSelectedMealTag} />
        </div>

        <QuickAiLog
          aiForm={aiForm}
          aiError={aiError}
          aiResult={aiResult}
          usedModel={usedModel}
          fallbackFrom={fallbackFrom}
          aiFeedback={aiFeedback}
          setAiFeedback={setAiFeedback}
          selectedMealTag={selectedMealTag}
          resolvedPreferredModel={resolvedPreferredModel}
          parseMealMutation={parseMealMutation}
          createMealMutation={createMealMutation}
          handleAiParse={handleAiParse}
          saveParsedMeal={saveParsedMeal}
        />
      </SectionCard>

      <SectionCard className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-base font-semibold text-[#f5f5f5]">
              <PencilLine className="h-4 w-4 text-[#888]" />
              Manual entry
            </div>
            <p className="mt-1 text-sm text-[#888]">
              Use this when you already have calories and macros.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowManualEntry((value) => !value)}
            className="rounded-full"
          >
            {showManualEntry ? 'Hide manual form' : 'Enter manually'}
          </Button>
        </div>

        {showManualEntry ? (
          <ManualMealForm
            manualForm={manualForm}
            createMealMutation={createMealMutation}
            handleManualSubmit={handleManualSubmit}
          />
        ) : null}
      </SectionCard>
    </div>
  )
}
