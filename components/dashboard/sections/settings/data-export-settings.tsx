'use client'

import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  getApiErrorMessage,
  type useExportDataMutation,
} from '@/hooks/dashboard'

export function DataExportSettings({
  exportDataMutation,
}: {
  exportDataMutation: ReturnType<typeof useExportDataMutation>
}) {
  async function downloadExport(format: 'csv' | 'json') {
    try {
      const { blob, filename } = await exportDataMutation.mutateAsync(format)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
      toast.success(`${format.toUpperCase()} export ready`)
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          `Could not export ${format.toUpperCase()} data`
        )
      )
    }
  }

  return (
    <div>
      <h3 className="mb-4 text-lg text-[#f5f5f5]">Data</h3>
      <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
        <div className="space-y-6">
          <div className="text-sm text-[#777]">
            Export your Nutrix data as a full JSON archive or a flat meals CSV
            for spreadsheets.
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              type="button"
              disabled={exportDataMutation.isPending}
              onClick={() => void downloadExport('json')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#141414] px-4 py-6 font-medium text-[#f5f5f5] transition-colors hover:border-[#e4ff00]/50 hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportDataMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              Export JSON Archive
            </Button>
            <Button
              type="button"
              disabled={exportDataMutation.isPending}
              onClick={() => void downloadExport('csv')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#141414] px-4 py-6 font-medium text-[#f5f5f5] transition-colors hover:border-[#e4ff00]/50 hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportDataMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              Export Meals CSV
            </Button>
          </div>
          <div className="text-xs leading-relaxed text-[#666]">
            JSON includes profile, goals, reports, integrations, and meals. CSV
            exports meal items in spreadsheet-friendly rows.
          </div>
        </div>
      </div>
    </div>
  )
}
