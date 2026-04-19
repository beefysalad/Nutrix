'use client'

import { useState } from 'react'
import { PlusCircle, Search, Sparkles } from 'lucide-react'

import { EmptyState, SectionCard, cn } from '@/components/dashboard/ui'

export function LogMealSection() {
  const [activeTab, setActiveTab] = useState<'search' | 'custom' | 'ai'>('search')
  const [selectedMealTag, setSelectedMealTag] = useState('breakfast')

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap gap-2">
        {['breakfast', 'lunch', 'snack', 'dinner'].map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedMealTag(tag)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition-colors',
              selectedMealTag === tag
                ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]',
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      <SectionCard className="overflow-hidden p-0">
        <div className="grid grid-cols-3 border-b border-white/10">
          {[
            { id: 'search', label: 'Search Food', icon: Search },
            { id: 'custom', label: 'Custom Entry', icon: PlusCircle },
            { id: 'ai', label: 'AI Parse', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon
            const selected = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'search' | 'custom' | 'ai')}
                className={cn(
                  'flex items-center justify-center gap-2 px-4 py-4 text-sm transition-colors',
                  selected ? 'border-b-2 border-[#e4ff00] text-[#e4ff00]' : 'text-[#888] hover:text-[#f5f5f5]',
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-6">
          {activeTab === 'search' ? (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search for food..."
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
              />
              <EmptyState
                title="Food search is not connected yet"
                description="The hardcoded search results are gone. Once we add a food repository or external food API, search results can feed real MealItem records."
              />
            </div>
          ) : null}

          {activeTab === 'custom' ? (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Food name"
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
              />
              <div className="grid gap-4 md:grid-cols-2">
                {['Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)'].map((field) => (
                  <input
                    key={field}
                    type="number"
                    placeholder={field}
                    className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 font-mono text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
                  />
                ))}
              </div>
              <input
                type="text"
                placeholder="Serving size"
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
              />
              <button className="w-full rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d]">
                Add Custom Food
              </button>
            </div>
          ) : null}

          {activeTab === 'ai' ? (
            <div className="space-y-4">
              <textarea
                rows={6}
                placeholder="Paste what you ate... e.g. 2 eggs, toast, orange juice"
                className="w-full resize-none rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
              />
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d]">
                <Sparkles className="h-4 w-4" />
                Parse with AI
              </button>
              <EmptyState
                title="AI meal parsing has no backend yet"
                description="This tab is ready for an AI integration, but it no longer shows fake detected foods. When we add parsing, the output should write directly into MealEntry and MealItem."
              />
            </div>
          ) : null}
        </div>
      </SectionCard>
    </div>
  )
}
