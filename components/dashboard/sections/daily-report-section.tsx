'use client'

import { useState } from 'react'
import { Download, Share2 } from 'lucide-react'

import { EmptyState, SectionCard, cn } from '@/components/dashboard/ui'

export function DailyReportSection() {
  const [rating, setRating] = useState(4)
  const [note, setNote] = useState('')

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <SectionCard className="p-8">
          <EmptyState
            title="Daily reports are empty until meal data exists"
            description="This report no longer shows a fake total or fabricated meal breakdown. Once real meal entries are in place, this page can summarize a selected day."
          />

          <div className="mb-8 border-t border-white/10 pt-8">
            <label className="mb-3 block text-sm text-[#777]">Rate your day</label>
            <div className="mb-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    value <= rating
                      ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                      : 'border-white/10 bg-[#0a0a0a] text-[#888] hover:border-[#e4ff00]/40',
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a note about your day..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] transition-colors hover:border-[#e4ff00]/50">
              <Download className="h-4 w-4" />
              Export as Image
            </button>
            <button className="flex items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d]">
              <Share2 className="h-4 w-4" />
              Share to Telegram
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
