'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import api from '@/lib/axios'

type UnitSystem = 'metric' | 'imperial'
type AiModel = 'gemini-2.5-flash-lite' | 'gemini-2.5-flash'
type GoalMode = 'cutting' | 'maintenance' | 'bulking' | 'custom'
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'

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
}

export type ParsedMeal = {
  mealType: MealType
  notes?: string | null
  items: Array<{
    foodName: string
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

export function useCreateMealMutation() {
  return useMutation({
    mutationFn: async (input: {
      mealType: MealType
      source: 'manual' | 'ai'
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
  })
}

export { getApiErrorMessage }
