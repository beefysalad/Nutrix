'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import api from '@/lib/axios'
import { type OnboardingFormValues } from '@/lib/validations/dashboard-forms'

type UnitSystem = 'metric' | 'imperial'
type AiModel = 'gemini-2.5-flash-lite' | 'gemini-2.5-flash'
type GoalMode = 'cutting' | 'maintenance' | 'bulking' | 'custom'
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
type SuggestionStyle = 'quick' | 'lutong-bahay' | 'budget' | 'high-protein'
type EntrySource = 'manual' | 'search' | 'ai' | 'telegram'
type AiMealFeedback = 'accurate' | 'inaccurate'

export type PreferencesResponse = {
  preferences: {
    unitSystem: UnitSystem
    aiModel: AiModel
    aiModelPersistencePendingMigration?: boolean
  }
}

export type TelegramIntegrationResponse = {
  connection: {
    status: 'connected' | 'disconnected' | 'error'
    username: string | null
    externalUserId: string | null
    connectedAt: string | null
    chatId: string | null
  }
  webhook: {
    configured: boolean
    expectedUrl: string | null
    registeredUrl: string | null
    registered: boolean
    pendingUpdateCount: number | null
    lastErrorMessage: string | null
  }
}

export type GoalResponse = {
  goal: {
    id: string
    mode: GoalMode
    dailyCalories: number | null
    proteinGrams: number | null
    carbsGrams: number | null
    fatGrams: number | null
    startsAt: string | null
    endsAt: string | null
  } | null
  profile: {
    gender: 'male' | 'female' | null
    age: number | null
    weightKg: number | null
    heightCm: number | null
    activityLevel:
      | 'sedentary'
      | 'lightly-active'
      | 'moderately-active'
      | 'very-active'
      | null
  } | null
}

export type ParsedMeal = {
  mealType: MealType
  notes?: string | null
  confidence?: number
  assumptions?: string[]
  needsReview?: boolean
  items: Array<{
    foodName: string
    canonicalFoodName?: string
    quantity?: number | null
    unit?: string | null
    calories: number
    proteinGrams?: number | null
    carbsGrams?: number | null
    fatGrams?: number | null
  }>
}

export type ParseMealResponse = {
  model: string
  fallbackFrom?: string
  parsed: ParsedMeal
}

export type MealSuggestionResponse = {
  usage: {
    dailyLimit: number
    usedToday: number
    remainingToday: number
    resetAtLabel: string
    suggestionDate: string
  }
  payload: {
    model: string
    basedOn: {
      goalMode: GoalMode | null
      recentFoods: string[]
      generatedForMealType: MealType | null
      suggestionStyle: SuggestionStyle | null
    }
    suggestions: Array<{
      id: string
      recipeId: string
      name: string
      description: string
      calories: number
      protein: number
      carbs: number
      fat: number
      tags: string[]
      reasoning: string
      prepTime: string
      difficulty: 'easy' | 'medium'
      sourceLabel: string
      sourceUrl: string
      isSaved: boolean
    }>
  } | null
}

export type SavedMealSuggestionsResponse = {
  suggestions: NonNullable<MealSuggestionResponse['payload']>['suggestions']
}

export type MealItemResponse = {
  id: string
  foodNameSnapshot: string
  quantity: string | number | null
  unit: string | null
  calories: number
  proteinGrams: string | number | null
  carbsGrams: string | number | null
  fatGrams: string | number | null
}

export type MealResponse = {
  id: string
  loggedAt: string
  mealType: MealType
  notes: string | null
  source: EntrySource
  aiFeedback: AiMealFeedback | null
  items: MealItemResponse[]
}

export type MealsResponse = {
  meals: MealResponse[]
}

export type DashboardSummaryResponse = {
  onBoarded: boolean
  date: string
  hasAnyMealHistory: boolean
  goal: {
    id: string
    dailyCalories: number | null
    proteinGrams: number | null
    carbsGrams: number | null
    fatGrams: number | null
    mode: GoalMode
  } | null
  totals: {
    calories: number
    proteinGrams: number
    carbsGrams: number
    fatGrams: number
    mealCount: number
  }
  remainingCalories: number | null
  meals: MealResponse[]
  recentMeals: MealResponse[]
}

export type DashboardTrendsResponse = {
  days: 7
  goalCalories: number | null
  points: Array<{
    date: string
    label: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }>
}

export type DashboardInsightsResponse = {
  hasData: boolean
  insight: {
    daysLogged: number
    mealCount: number
    mostCommonMealType: string | null
    averageCalories: number
    remainingCalories: number | null
    averageProteinPerMeal: number
    averageCarbsPerMeal: number
    averageFatPerMeal: number
    topFoods: Array<{
      name: string
      count: number
    }>
    primaryInsight: string
    secondaryInsight: string | null
    actionInsight: string | null
  } | null
}

export type DailyReportResponse = {
  report: {
    id: string
    reportDate: string
    rating: number | null
    note: string | null
  } | null
  totals: {
    calories: number
    proteinGrams: number
    carbsGrams: number
    fatGrams: number
    mealCount: number
  }
  meals: MealResponse[]
}

type ExportFormat = 'csv' | 'json'

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.details ||
      error.response?.data?.error ||
      error.message ||
      fallback
    )
  }

  return error instanceof Error ? error.message : fallback
}

export function usePreferencesQuery() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: async () => {
      const response = await api.get<PreferencesResponse>('/settings/preferences')
      return response.data
    },
  })
}

export function useTelegramIntegrationQuery() {
  return useQuery({
    queryKey: ['telegram-integration'],
    queryFn: async () => {
      const response = await api.get<TelegramIntegrationResponse>('/integrations/telegram')
      return response.data
    },
  })
}

export function useSavePreferencesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { unitSystem: UnitSystem; aiModel: AiModel }) => {
      const response = await api.put<PreferencesResponse>('/settings/preferences', input)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['preferences'], data)
    },
  })
}

export function useGoalsQuery() {
  return useQuery({
    queryKey: ['active-goal'],
    queryFn: async () => {
      const response = await api.get<GoalResponse>('/goals/active')
      return response.data
    },
  })
}

export function useDashboardSummaryQuery() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await api.get<DashboardSummaryResponse>('/dashboard/summary')
      return response.data
    },
  })
}

export function useMealsQuery(input?: {
  limit?: number
  dateFrom?: string
  dateTo?: string
}) {
  return useQuery({
    queryKey: ['meals', input?.limit ?? null, input?.dateFrom ?? null, input?.dateTo ?? null],
    queryFn: async () => {
      const response = await api.get<MealsResponse>('/meals', {
        params: {
          ...(input?.limit ? { limit: input.limit } : {}),
          ...(input?.dateFrom ? { dateFrom: input.dateFrom } : {}),
          ...(input?.dateTo ? { dateTo: input.dateTo } : {}),
        },
      })
      return response.data
    },
  })
}

export function useDailyReportQuery(date: string) {
  return useQuery({
    queryKey: ['daily-report', date],
    queryFn: async () => {
      const response = await api.get<DailyReportResponse>('/reports/daily', {
        params: { date },
      })
      return response.data
    },
  })
}

export function useDashboardTrendsQuery() {
  return useQuery({
    queryKey: ['dashboard-trends', 7],
    queryFn: async () => {
      const response = await api.get<DashboardTrendsResponse>('/dashboard/trends', {
        params: { days: 7 },
      })
      return response.data
    },
  })
}

export function useDashboardInsightsQuery() {
  return useQuery({
    queryKey: ['dashboard-insights'],
    queryFn: async () => {
      const response = await api.get<DashboardInsightsResponse>('/dashboard/insights')
      return response.data
    },
  })
}

export function useSaveGoalsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      mode: GoalMode
      dailyCalories?: number
      proteinGrams?: number
      carbsGrams?: number
      fatGrams?: number
    }) => {
      const response = await api.put<GoalResponse>('/goals/active', input)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['active-goal'], data)
      void queryClient.invalidateQueries({ queryKey: ['meal-suggestions'] })
    },
  })
}

export function useParseMealMutation() {
  return useMutation({
    mutationFn: async (input: { text: string; mealType?: MealType }) => {
      const response = await api.post<ParseMealResponse>('/ai/parse-meal', input)
      return response.data
    },
  })
}

export function useMealSuggestionsQuery(input?: { style?: SuggestionStyle }) {
  return useQuery({
    queryKey: ['meal-suggestions', input?.style ?? 'quick'],
    queryFn: async () => {
      const response = await api.get<MealSuggestionResponse>('/ai/meal-suggestions', {
        params: {
          ...(input?.style ? { style: input.style } : {}),
        },
      })
      return response.data
    },
  })
}

export function useGenerateMealSuggestionsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input?: { style?: SuggestionStyle }) => {
      const response = await api.post<MealSuggestionResponse>('/ai/meal-suggestions', {
        ...(input?.style ? { style: input.style } : {}),
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['meal-suggestions', variables?.style ?? 'quick'], data)
    },
  })
}

export function useSavedMealSuggestionsQuery() {
  return useQuery({
    queryKey: ['meal-suggestions', 'saved'],
    queryFn: async () => {
      const response = await api.get<SavedMealSuggestionsResponse>('/ai/meal-suggestions/saved')
      return response.data
    },
  })
}

export function useSaveMealSuggestionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { suggestionId: string; isSaved?: boolean }) => {
      const response = await api.post(`/ai/meal-suggestions/${input.suggestionId}/save`, {
        isSaved: input.isSaved ?? true,
      })
      return response.data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['meal-suggestions'] }),
        queryClient.invalidateQueries({ queryKey: ['meal-suggestions', 'saved'] }),
      ])
    },
  })
}

export function useCreateMealMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      mealType: MealType
      source: 'manual' | 'ai'
      aiFeedback?: AiMealFeedback
      notes?: string
      items: Array<{
        foodName: string
        quantity?: number
        unit?: string
        calories: number
        proteinGrams?: number
        carbsGrams?: number
        fatGrams?: number
      }>
    }) => {
      const response = await api.post('/meals', input)
      return response.data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['meals'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-trends'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-insights'] }),
        queryClient.invalidateQueries({ queryKey: ['meal-suggestions'] }),
      ])
    },
  })
}

export function useUpdateMealAiFeedbackMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      mealId: string
      aiFeedback: AiMealFeedback | null
    }) => {
      const response = await api.patch(`/meals/${input.mealId}/feedback`, {
        aiFeedback: input.aiFeedback,
      })
      return response.data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['meals'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-trends'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-insights'] }),
        queryClient.invalidateQueries({ queryKey: ['meal-suggestions'] }),
      ])
    },
  })
}

export function useDeleteMealMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (mealId: string) => {
      const response = await api.delete(`/meals/${mealId}`)
      return response.data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['meals'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['daily-report'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-trends'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-insights'] }),
        queryClient.invalidateQueries({ queryKey: ['meal-suggestions'] }),
      ])
    },
  })
}

export function useSaveDailyReportMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      date: string
      rating: number
      note?: string
    }) => {
      const response = await api.put<DailyReportResponse['report']>(
        '/reports/daily',
        {
          rating: input.rating,
          note: input.note,
        },
        {
          params: { date: input.date },
        },
      )
      return response.data
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['daily-report', variables.date],
      })
    },
  })
}

export function useOnboardingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: OnboardingFormValues) => {
      const response = await api.post('/user/onboarding', input)
      return response.data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['meal-suggestions'] }),
      ])
    },
  })
}

export function useExportDataMutation() {
  return useMutation({
    mutationFn: async (format: ExportFormat) => {
      const response = await api.get<Blob>('/export', {
        params: { format },
        responseType: 'blob',
      })

      const contentDisposition = response.headers['content-disposition']
      const filenameMatch =
        typeof contentDisposition === 'string'
          ? /filename="([^"]+)"/.exec(contentDisposition)
          : null

      return {
        blob: response.data,
        filename:
          filenameMatch?.[1] ??
          (format === 'csv' ? 'nutrix-meals-export.csv' : 'nutrix-export.json'),
      }
    },
  })
}

export { getApiErrorMessage }
