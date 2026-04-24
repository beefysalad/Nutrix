import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import api from '@/lib/axios'

import {
  type AiModel,
  type PreferencesResponse,
  type TelegramIntegrationResponse,
  type UnitSystem,
} from './types'

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
