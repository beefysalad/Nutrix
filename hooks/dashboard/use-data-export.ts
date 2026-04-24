import { useMutation } from '@tanstack/react-query'

import api from '@/lib/axios'

import { type ExportFormat } from './types'

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
