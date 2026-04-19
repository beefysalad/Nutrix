'use client'

import { useState } from 'react'
import { Download, Share2, Sparkles } from 'lucide-react'

import { SectionCard, cn } from '@/components/dashboard/ui'

export function DailyReportSection() {
  const [rating, setRating] = useState(4)
  const [note, setNote] = useState('')

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <SectionCard className="p-8">
          <div className="mb-8 text-center">
            <div className="mb-2 text-sm text-[#777]">Saturday, April 19, 2026</div>
            <div className="font-mono text-6xl text-[#4ade80]">1650</div>
            <div className="text-sm text-[#777]">of 2000 calories</div>
          </div>

          <div className="mb-8 space-y-4">
            {[
              ['Protein', 120, 150, '#4ade80'],
              ['Carbs', 180, 200, '#22c55e'],
              ['Fat', 55, 67, '#888888'],
            ].map(([name, current, goal, color]) => (
              <div key={name} className="flex items-center gap-4">
                <span className="w-20 text-sm text-[#777]">{name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(Number(current) / Number(goal)) * 100}%`, backgroundColor: String(color) }}
                  />
                </div>
                <span className="w-28 text-right font-mono text-sm text-[#f5f5f5]">
                  {current}g / {goal}g
                </span>
              </div>
            ))}
          </div>

          <div className="mb-8 border-t border-white/10 pt-8">
            <h3 className="mb-4 text-lg text-[#f5f5f5]">Meal Breakdown</h3>
            <div className="space-y-4">
              {[
                ['Breakfast', 450, ['Oatmeal with berries', 'Greek yogurt']],
                ['Lunch', 600, ['Grilled chicken breast', 'Brown rice', 'Steamed broccoli']],
                ['Snack', 200, ['Apple with almond butter']],
                ['Dinner', 400, ['Salmon fillet', 'Quinoa', 'Mixed vegetables']],
              ].map(([meal, calories, items]) => (
                <div key={String(meal)} className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[#f5f5f5]">{meal}</span>
                    <span className="font-mono text-[#4ade80]">{calories} cal</span>
                  </div>
                  <div className="space-y-1 text-sm text-[#777]">
                    {(items as string[]).map((item) => (
                      <div key={item}>{item}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8 border-t border-white/10 pt-8">
            <div className="flex items-start gap-3 rounded-2xl border border-[#4ade80]/20 bg-[#4ade80]/10 p-4">
              <div className="rounded-xl bg-[#4ade80] p-2">
                <Sparkles className="h-4 w-4 text-[#0a0a0a]" />
              </div>
              <div>
                <div className="mb-1 text-sm text-[#f5f5f5]">AI Insight</div>
                <p className="text-sm text-[#888]">
                  Great protein intake today. A high-protein evening snack would likely close the remaining gap without pushing calories too hard.
                </p>
              </div>
            </div>
          </div>

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
                      ? 'border-[#4ade80] bg-[#4ade80] text-[#0a0a0a]'
                      : 'border-white/10 bg-[#0a0a0a] text-[#888] hover:border-[#4ade80]/40',
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
              className="w-full resize-none rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#4ade80]"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] transition-colors hover:border-[#4ade80]/50">
              <Download className="h-4 w-4" />
              Export as Image
            </button>
            <button className="flex items-center justify-center gap-2 rounded-2xl bg-[#4ade80] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#38c56c]">
              <Share2 className="h-4 w-4" />
              Share to Telegram
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
