'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, ChevronLeft, Loader2, PencilLine, PlusCircle, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { EmptyState, SectionCard, cn } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
type SheetLogMode = 'ai' | 'manual' | null

const mealTags: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'other']

function getDefaultMealTypeForCurrentTime(): MealType {
  const hour = new Date().getHours()

  if (hour < 11) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 18) return 'snack'
  return 'dinner'
}

function formatMealType(mealType: MealType | string) {
  return mealType.charAt(0).toUpperCase() + mealType.slice(1)
}

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

function LogModeChoice({ onSelect }: { onSelect: (mode: Exclude<SheetLogMode, null>) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onSelect('ai')}
        className="h-auto justify-start rounded-3xl p-5 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e4ff00] text-[#0a0a0a]">
          <Bot className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-semibold text-[#f5f5f5]">Log with AI</span>
          <span className="mt-1 block whitespace-normal text-sm leading-6 text-[#888]">
            Type a normal sentence and review the estimate.
          </span>
        </span>
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => onSelect('manual')}
        className="h-auto justify-start rounded-3xl p-5 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0a] text-[#d0d0d0]">
          <PencilLine className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-semibold text-[#f5f5f5]">Log manually</span>
          <span className="mt-1 block whitespace-normal text-sm leading-6 text-[#888]">
            Enter calories and macros yourself.
          </span>
        </span>
      </Button>
    </div>
  )
}

function MealTypeSelect({
  value,
  onChange,
}: {
  value: MealType
  onChange: (value: MealType) => void
}) {
  return (
    <div className="w-full sm:w-48">
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#666]">
        Meal
      </label>
      <Select value={value} onValueChange={(nextValue) => onChange(nextValue as MealType)}>
        <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-[#0a0a0a] text-[#f5f5f5]">
          <SelectValue placeholder="Choose meal" />
        </SelectTrigger>
        <SelectContent>
          {mealTags.map((mealType) => (
            <SelectItem key={mealType} value={mealType}>
              {formatMealType(mealType)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function QuickAiLog({
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

function MacroChip({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2">
      {label} {value ?? 0}g
    </div>
  )
}

function ManualMealForm({
  manualForm,
  createMealMutation,
  handleManualSubmit,
}: {
  manualForm: ReturnType<typeof useForm<ManualMealFormInput, unknown, ManualMealFormValues>>
  createMealMutation: ReturnType<typeof useCreateMealMutation>
  handleManualSubmit: (values: ManualMealFormValues) => Promise<void>
}) {
  const isSaving = manualForm.formState.isSubmitting || createMealMutation.isPending

  return (
    <form onSubmit={manualForm.handleSubmit(handleManualSubmit)} className="space-y-4">
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
        placeholder="Portion eaten, e.g. 1 cup, 2 pieces, 100g"
        aria-label="Portion eaten"
        {...manualForm.register('servingSize')}
        className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3.5 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
      />
      {manualForm.formState.errors.foodName || manualForm.formState.errors.calories ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
          {manualForm.formState.errors.foodName?.message ||
            manualForm.formState.errors.calories?.message}
        </div>
      ) : null}
      <Button
        type="submit"
        disabled={isSaving}
        className="flex w-full items-center justify-center gap-2 rounded-full"
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
        {isSaving ? 'Saving' : 'Save manual meal'}
      </Button>
    </form>
  )
}
