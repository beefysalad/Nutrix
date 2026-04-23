'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, ChevronLeft, Loader2, PlusCircle, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { EmptyState, SectionCard, cn } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
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
type MobileStep = 'mode' | 'meal' | 'form'
type MealInputMode = 'search' | 'custom' | 'ai'

const mealTags: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner']
const LAST_USED_MODE_STORAGE_KEY = 'nutrix-last-meal-input-mode'

function getDefaultMealTypeForCurrentTime(): MealType {
  const hour = new Date().getHours()

  if (hour < 11) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 18) return 'snack'
  return 'dinner'
}

export function LogMealSection({
  presentation = 'page',
  onClose,
}: {
  presentation?: 'page' | 'sheet'
  onClose?: () => void
}) {
  const [activeTab, setActiveTab] = useState<MealInputMode>(() => {
    if (typeof window === 'undefined') return 'search'
    const stored = window.localStorage.getItem(LAST_USED_MODE_STORAGE_KEY)
    if (stored === 'search' || stored === 'custom' || stored === 'ai') return stored
    return 'search'
  })
  const [selectedMealTag, setSelectedMealTag] = useState<MealType>(getDefaultMealTypeForCurrentTime)
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false)
  const [mobileStep, setMobileStep] = useState<MobileStep>('mode')
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
  const isSheetPresentation = presentation === 'sheet'

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(LAST_USED_MODE_STORAGE_KEY, activeTab)
  }, [activeTab])

  useEffect(() => {
    if (!isActionSheetOpen || isSheetPresentation) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isActionSheetOpen, isSheetPresentation])

  function openActionSheet() {
    setSelectedMealTag(getDefaultMealTypeForCurrentTime())
    setMobileStep('form')
    setIsActionSheetOpen(true)
  }

  function closeActionSheet() {
    setMobileStep('mode')
    if (isSheetPresentation) {
      onClose?.()
      return
    }

    setIsActionSheetOpen(false)
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
      closeActionSheet()
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
      closeActionSheet()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save custom meal'))
    }
  }

  const currentMode = tabs.find((tab) => tab.id === activeTab)

  if (isSheetPresentation) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {mobileStep !== 'mode' ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileStep(mobileStep === 'form' ? 'meal' : 'mode')}
                className="mt-0.5 rounded-full border border-white/10 bg-[#161616] text-[#888] hover:bg-[#161616] hover:text-[#f5f5f5]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : null}
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#666]">
                Meal Actions
              </div>
              <div className="mt-2 text-xl font-semibold text-[#f5f5f5]">
                {mobileStep === 'mode'
                  ? 'Choose input mode'
                  : mobileStep === 'meal'
                    ? 'Choose meal type'
                    : 'Log your meal'}
              </div>
              <div className="mt-1 text-sm text-[#777]">
                {mobileStep === 'mode'
                  ? 'Start with how you want to add this meal.'
                  : mobileStep === 'meal'
                    ? 'Now choose where this meal belongs in your day.'
                    : 'Start logging right away and change the mode or meal type only if needed.'}
                  </div>
                </div>
              </div>
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={closeActionSheet}
              className="rounded-full border border-white/10 bg-[#161616] text-[#888] hover:bg-[#161616] hover:text-[#f5f5f5]"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['mode', 'meal', 'form'] as MobileStep[]).map((step, index) => {
            const currentIndex = ['mode', 'meal', 'form'].indexOf(mobileStep)

            return (
              <div
                key={step}
                className={cn(
                  'rounded-full px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em]',
                  mobileStep === step
                    ? 'bg-[#e4ff00] text-[#0a0a0a]'
                    : index < currentIndex
                      ? 'bg-[#e4ff00]/12 text-[#e4ff00]'
                      : 'bg-[#161616] text-[#666]',
                )}
              >
                {step}
              </div>
            )
          })}
        </div>

        {mobileStep === 'mode' ? (
          <div className="grid gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const selected = activeTab === tab.id

              return (
                <Button
                  key={tab.id}
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMobileStep('meal')
                  }}
                  className={cn(
                    'h-auto w-full justify-start whitespace-normal rounded-2xl border px-4 py-4 text-left transition-colors hover:bg-transparent',
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
                </Button>
              )
            })}
          </div>
        ) : null}

        {mobileStep === 'meal' ? (
          <div className="grid grid-cols-2 gap-2">
            {mealTags.map((tag) => (
              <Button
                key={tag}
                type="button"
                variant="ghost"
                onClick={() => {
                  setSelectedMealTag(tag)
                  setMobileStep('form')
                }}
                className={cn(
                  'h-auto w-full whitespace-normal rounded-2xl border px-4 py-4 text-sm font-medium capitalize transition-colors hover:bg-transparent',
                  selectedMealTag === tag
                    ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                    : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]',
                )}
              >
                {tag}
              </Button>
            ))}
          </div>
        ) : null}

        {mobileStep === 'form' ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-4">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[#666]">
                Quick setup
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileStep('mode')}
                  className="rounded-full border border-white/10 bg-[#141414] px-3 text-sm text-[#f5f5f5] hover:bg-[#141414]"
                >
                  {currentMode?.label}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileStep('meal')}
                  className="rounded-full border border-white/10 bg-[#141414] px-3 text-sm capitalize text-[#f5f5f5] hover:bg-[#141414]"
                >
                  {selectedMealTag}
                </Button>
              </div>
            </div>
            <MealActionContent
              activeTab={activeTab}
              selectedMealTag={selectedMealTag}
              resolvedPreferredModel={resolvedPreferredModel}
              aiForm={aiForm}
              manualForm={manualForm}
              createMealMutation={createMealMutation}
              parseMealMutation={parseMealMutation}
              aiError={aiError}
              aiResult={aiResult}
              usedModel={usedModel}
              fallbackFrom={fallbackFrom}
              aiFeedback={aiFeedback}
              setAiFeedback={setAiFeedback}
              handleAiParse={handleAiParse}
              handleManualSubmit={handleManualSubmit}
              saveParsedMeal={saveParsedMeal}
              mobile
            />
          </div>
        ) : null}
      </div>
    )
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
          {mealTags.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant="ghost"
              onClick={() => setSelectedMealTag(tag)}
              className={cn(
                'h-auto w-full whitespace-normal rounded-2xl border px-4 py-3 text-sm font-medium capitalize transition-colors hover:bg-transparent sm:w-auto sm:rounded-full sm:px-4 sm:py-2',
                selectedMealTag === tag
                  ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                  : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]',
              )}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      <div className="md:hidden">
        <SectionCard className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#666]">
                Quick Actions
              </div>
              <div className="mt-2 text-lg font-semibold text-[#f5f5f5]">
                {selectedMealTag} via {currentMode?.label}
              </div>
              <div className="mt-1 text-sm text-[#777]">
                Open the action sheet and go step by step: mode, meal type, then logging.
              </div>
            </div>
            <div className="rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#e4ff00]">
              Mobile
            </div>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={openActionSheet}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d]"
          >
            <PlusCircle className="h-4 w-4" />
            Open Meal Actions
          </Button>
        </SectionCard>
      </div>

      <SectionCard className="hidden overflow-hidden p-0 md:block">
        <div className="border-b border-white/10 p-3 sm:p-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const selected = activeTab === tab.id

              return (
                <Button
                  key={tab.id}
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'h-auto w-full justify-start whitespace-normal rounded-2xl border px-4 py-3 text-left transition-colors hover:bg-transparent',
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
                </Button>
              )
            })}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <MealActionContent
            activeTab={activeTab}
            selectedMealTag={selectedMealTag}
            resolvedPreferredModel={resolvedPreferredModel}
            aiForm={aiForm}
            manualForm={manualForm}
            createMealMutation={createMealMutation}
            parseMealMutation={parseMealMutation}
            aiError={aiError}
            aiResult={aiResult}
            usedModel={usedModel}
            fallbackFrom={fallbackFrom}
            aiFeedback={aiFeedback}
            setAiFeedback={setAiFeedback}
            handleAiParse={handleAiParse}
            handleManualSubmit={handleManualSubmit}
            saveParsedMeal={saveParsedMeal}
          />
        </div>
      </SectionCard>

      {isActionSheetOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/60 backdrop-blur-sm md:hidden">
          <Button
            type="button"
            aria-label="Close meal actions"
            className="absolute inset-0 cursor-default"
            onClick={closeActionSheet}
          />
          <div className="relative z-10 max-h-[88dvh] w-full overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#111111]">
            <div className="flex justify-center pt-3">
              <div className="h-1.5 w-14 rounded-full bg-white/10" />
            </div>

            <div className="flex items-start justify-between gap-4 px-4 pb-4 pt-3">
              <div className="flex min-w-0 items-start gap-3">
                {mobileStep !== 'mode' ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setMobileStep(mobileStep === 'form' ? 'meal' : 'mode')}
                    className="mt-0.5 rounded-full border border-white/10 bg-[#161616] text-[#888] hover:bg-[#161616] hover:text-[#f5f5f5]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                ) : null}
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-[#666]">
                    Meal Actions
                  </div>
                  <div className="mt-2 text-xl font-semibold text-[#f5f5f5]">
                    {mobileStep === 'mode'
                      ? 'Choose input mode'
                      : mobileStep === 'meal'
                        ? 'Choose meal type'
                        : 'Finish logging'}
                  </div>
                  <div className="mt-1 text-sm text-[#777]">
                    {mobileStep === 'mode'
                      ? 'Start with how you want to add this meal.'
                      : mobileStep === 'meal'
                        ? 'Now choose where this meal belongs in your day.'
                        : 'Complete the meal entry form below.'}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={closeActionSheet}
                className="rounded-full border border-white/10 bg-[#161616] text-[#888] hover:bg-[#161616] hover:text-[#f5f5f5]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-4 pb-3">
              <div className="grid grid-cols-3 gap-2">
                {(['mode', 'meal', 'form'] as MobileStep[]).map((step, index) => {
                  const currentIndex = ['mode', 'meal', 'form'].indexOf(mobileStep)

                  return (
                    <div
                      key={step}
                      className={cn(
                        'rounded-full px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.18em]',
                        mobileStep === step
                          ? 'bg-[#e4ff00] text-[#0a0a0a]'
                          : index < currentIndex
                            ? 'bg-[#e4ff00]/12 text-[#e4ff00]'
                            : 'bg-[#161616] text-[#666]',
                      )}
                    >
                      {step}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="max-h-[calc(88dvh-148px)] overflow-y-auto px-4 pb-6">
              {mobileStep === 'mode' ? (
                <div className="grid gap-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const selected = activeTab === tab.id

                    return (
                      <Button
                        key={tab.id}
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setActiveTab(tab.id)
                          setMobileStep('meal')
                        }}
                        className={cn(
                          'h-auto w-full justify-start whitespace-normal rounded-2xl border px-4 py-4 text-left transition-colors hover:bg-transparent',
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
                      </Button>
                    )
                  })}
                </div>
              ) : null}

              {mobileStep === 'meal' ? (
                <div className="grid grid-cols-2 gap-2">
                  {mealTags.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setSelectedMealTag(tag)
                        setMobileStep('form')
                      }}
                      className={cn(
                        'h-auto w-full whitespace-normal rounded-2xl border px-4 py-4 text-sm font-medium capitalize transition-colors hover:bg-transparent',
                        selectedMealTag === tag
                          ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                          : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]',
                      )}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              ) : null}

              {mobileStep === 'form' ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-[#666]">
                      Selected Flow
                    </div>
                    <div className="mt-2 text-sm text-[#f5f5f5]">
                      {currentMode?.label} for {selectedMealTag}
                    </div>
                  </div>
                  <SectionCard className="p-0">
                    <div className="p-4">
                      <MealActionContent
                        activeTab={activeTab}
                        selectedMealTag={selectedMealTag}
                        resolvedPreferredModel={resolvedPreferredModel}
                        aiForm={aiForm}
                        manualForm={manualForm}
                        createMealMutation={createMealMutation}
                        parseMealMutation={parseMealMutation}
                        aiError={aiError}
                        aiResult={aiResult}
                        usedModel={usedModel}
                        fallbackFrom={fallbackFrom}
                        aiFeedback={aiFeedback}
                        setAiFeedback={setAiFeedback}
                        handleAiParse={handleAiParse}
                        handleManualSubmit={handleManualSubmit}
                        saveParsedMeal={saveParsedMeal}
                        mobile
                      />
                    </div>
                  </SectionCard>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MealActionContent({
  activeTab,
  selectedMealTag,
  resolvedPreferredModel,
  aiForm,
  manualForm,
  createMealMutation,
  parseMealMutation,
  aiError,
  aiResult,
  usedModel,
  fallbackFrom,
  aiFeedback,
  setAiFeedback,
  handleAiParse,
  handleManualSubmit,
  saveParsedMeal,
  mobile = false,
}: {
  activeTab: MealInputMode
  selectedMealTag: MealType
  resolvedPreferredModel: AiModel
  aiForm: ReturnType<typeof useForm<AiMealParseFormValues>>
  manualForm: ReturnType<typeof useForm<ManualMealFormInput, unknown, ManualMealFormValues>>
  createMealMutation: ReturnType<typeof useCreateMealMutation>
  parseMealMutation: ReturnType<typeof useParseMealMutation>
  aiError: string | null
  aiResult: ParsedMeal | null
  usedModel: string | null
  fallbackFrom: string | null
  aiFeedback: AiFeedback
  setAiFeedback: (value: AiFeedback) => void
  handleAiParse: (values: AiMealParseFormValues) => Promise<void>
  handleManualSubmit: (values: ManualMealFormValues) => Promise<void>
  saveParsedMeal: () => Promise<void>
  mobile?: boolean
}) {
  if (activeTab === 'search') {
    return (
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
          description="USDA Food Database is not connected yet."
        />
      </div>
    )
  }

  if (activeTab === 'custom') {
    return (
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
        <div className={cn('grid gap-4', mobile ? 'grid-cols-1' : 'md:grid-cols-2')}>
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
          disabled={manualForm.formState.isSubmitting || createMealMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3.5 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {manualForm.formState.isSubmitting || createMealMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          Add Custom Food
        </Button>
      </form>
    )
  }

  return (
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
        <Button
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
        </Button>
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
              {aiResult.mealType ?? selectedMealTag}
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
                  <div className="text-right text-sm text-[#f5f5f5]">{Math.round(item.calories)} cal</div>
                </div>
                <div className={cn('mt-3 grid grid-cols-3 gap-2 text-xs text-[#888]')}>
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
            <div className="mt-3 flex flex-wrap gap-3">
              <Button
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
              </Button>
              <Button
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
              </Button>
            </div>
          </div>

          <Button
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
          </Button>
        </div>
      ) : (
        <EmptyState
          title="Paste a meal and let Gemini structure it"
          description="Nutrix will estimate calories and macros, then you can review and save the parsed meal into your history."
        />
      )}
    </div>
  )
}
