import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import api from '@/lib/axios'

import {
  type AiMealFeedback,
  type MealsResponse,
  type MealType,
  type ParseMealResponse,
} from './types'

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

export function useParseMealMutation() {
  return useMutation({
    mutationFn: async (input: { text: string; mealType?: MealType }) => {
      const response = await api.post<ParseMealResponse>('/ai/parse-meal', input)
      return response.data
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
