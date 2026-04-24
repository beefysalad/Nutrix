import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import api from '@/lib/axios'

import {
  type MealSuggestionResponse,
  type MealType,
  type SavedMealSuggestionsResponse,
  type SuggestionStyle,
} from './types'
import { AI_GENERATION_TIMEOUT_MS } from './utils'

export function useMealSuggestionsQuery(input?: {
  style?: SuggestionStyle
  mealType?: MealType
}) {
  return useQuery({
    queryKey: ['meal-suggestions', input?.style ?? 'quick', input?.mealType ?? 'any'],
    queryFn: async () => {
      const response = await api.get<MealSuggestionResponse>('/ai/meal-suggestions', {
        params: {
          ...(input?.style ? { style: input.style } : {}),
          ...(input?.mealType ? { mealType: input.mealType } : {}),
        },
      })
      return response.data
    },
  })
}

export function useGenerateMealSuggestionsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input?: { style?: SuggestionStyle; mealType?: MealType }) => {
      const response = await api.post<MealSuggestionResponse>(
        '/ai/meal-suggestions',
        {
          ...(input?.style ? { style: input.style } : {}),
          ...(input?.mealType ? { mealType: input.mealType } : {}),
        },
        {
          timeout: AI_GENERATION_TIMEOUT_MS,
        },
      )
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ['meal-suggestions', variables?.style ?? 'quick', variables?.mealType ?? 'any'],
        data,
      )
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
