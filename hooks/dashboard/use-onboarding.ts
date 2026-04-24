import { useMutation, useQueryClient } from '@tanstack/react-query'

import api from '@/lib/axios'
import { type OnboardingFormValues } from '@/lib/validations/dashboard-forms'

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
