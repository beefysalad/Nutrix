import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import api from '@/lib/axios'

import { type DailyReportResponse } from './types'

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
