'use client'

import { useState } from 'react'
import { PlusCircle, Search, Sparkles } from 'lucide-react'

import { mealTags, mealsData } from '@/components/dashboard/data'
import { SectionCard, cn } from '@/components/dashboard/ui'

export function LogMealSection() {
  const [activeTab, setActiveTab] = useState<'search' | 'custom' | 'ai'>('search')
  const [selectedMealTag, setSelectedMealTag] = useState('Lunch')

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap gap-2">
        {mealTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedMealTag(tag)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition-colors',
              selectedMealTag === tag
                ? 'border-[#4ade80] bg-[#4ade80] text-[#0a0a0a]'
                : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#4ade80]/50 hover:text-[#f5f5f5]',
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
                  selected ? 'border-b-2 border-[#4ade80] text-[#4ade80]' : 'text-[#888] hover:text-[#f5f5f5]',
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
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#4ade80]"
              />
              <div className="space-y-3">
                {mealsData.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <div className="text-[#f5f5f5]">{item.name}</div>
                      <div className="text-sm text-[#777]">
                        100g - P: {item.protein}g C: {item.carbs}g F: {item.fat}g
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[#4ade80]">{item.calories}</span>
                      <input
                        type="number"
                        defaultValue="1"
                        className="w-16 rounded-xl border border-white/10 bg-[#141414] px-2 py-2 text-center font-mono text-[#f5f5f5] outline-none focus:border-[#4ade80]"
                      />
                      <button className="rounded-xl bg-[#4ade80] px-4 py-2 text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-[#38c56c]">
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === 'custom' ? (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Food name"
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#4ade80]"
              />
              <div className="grid gap-4 md:grid-cols-2">
                {['Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)'].map((field) => (
                  <input
                    key={field}
                    type="number"
                    placeholder={field}
                    className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 font-mono text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#4ade80]"
                  />
                ))}
              </div>
              <input
                type="text"
                placeholder="Serving size"
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#4ade80]"
              />
              <button className="w-full rounded-2xl bg-[#4ade80] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#38c56c]">
                Add Custom Food
              </button>
            </div>
          ) : null}

          {activeTab === 'ai' ? (
            <div className="space-y-4">
              <textarea
                rows={6}
                placeholder="Paste what you ate... e.g. 2 eggs, toast, orange juice"
                className="w-full resize-none rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#4ade80]"
              />
              <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4ade80] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#38c56c]">
                <Sparkles className="h-4 w-4" />
                Parse with AI
              </button>
              <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#4ade80]" />
                  <span className="text-sm text-[#888]">Detected foods</span>
                </div>
                <div className="space-y-2">
                  {[
                    ['2 scrambled eggs', '140 cal'],
                    ['1 slice toast with butter', '150 cal'],
                    ['Orange juice (1 cup)', '110 cal'],
                  ].map(([name, cals]) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="text-[#f5f5f5]">{name}</span>
                      <span className="font-mono text-[#4ade80]">{cals}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm text-[#888]">Total</span>
                  <span className="font-mono text-lg text-[#4ade80]">400 cal</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </SectionCard>
    </div>
  )
}
