import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import api from '@/lib/axios'

import { type GoalMode, type GoalResponse } from './types'

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
      void queryClient.invalidateQueries({ queryKey: ['meal-suggestions'] })
    },
  })
}
