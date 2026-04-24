import { useQuery } from '@tanstack/react-query'

import api from '@/lib/axios'

import {
  type DashboardInsightsResponse,
  type DashboardSummaryResponse,
  type DashboardTrendsResponse,
} from './types'

export function useDashboardSummaryQuery() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await api.get<DashboardSummaryResponse>('/dashboard/summary')
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
