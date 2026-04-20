'use client'

import { 
  Sparkles, 
  RotateCcw, 
  Clock,
  AlertCircle,
  ChefHat,
  Target,
  Salad
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { SectionCard, cn } from '@/components/dashboard/ui'

interface Suggestion {
  id: string
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
  tags: string[]
  reasoning: string
  prepTime: string
}

const MOCK_SUGGESTIONS: Suggestion[] = [
  {
    id: '1',
    name: 'Chicken Inasal with Garlic Rice',
    description: 'Juicy grilled chicken inasal served with garlic rice, pickled papaya, and a side of cucumber.',
    calories: 560,
    protein: 41,
    carbs: 48,
    fat: 18,
    tags: ['High Protein', 'Pinoy Favorite'],
    reasoning: 'A strong high-protein Filipino staple that fits well when you want something satisfying without going too heavy.',
    prepTime: '20 min'
  },
  {
    id: '2',
    name: 'Bangus Sisig Lettuce Bowl',
    description: 'Flaked milkfish sisig served over crisp lettuce with onions, calamansi, and a light chili finish.',
    calories: 340,
    protein: 32,
    carbs: 10,
    fat: 19,
    tags: ['Low Carb', 'Seafood'],
    reasoning: 'This keeps the bold sisig flavor profile while staying lower in carbs and easier to fit into a cut.',
    prepTime: '15 min'
  },
  {
    id: '3',
    name: 'Ginisang Monggo with Malunggay',
    description: 'Hearty sauteed mung beans with malunggay, tomatoes, and soft vegetables for a lighter plant-forward option.',
    calories: 420,
    protein: 24,
    carbs: 38,
    fat: 14,
    tags: ['Plant-Based', 'Fiber'],
    reasoning: 'A comforting Filipino dish with good fiber and steady energy, useful for a more balanced meal suggestion.',
    prepTime: '15 min'
  }
]

export function SuggestionsSection() {
  const [activeCategory, setActiveCategory] = useState('All')
  const filteredSuggestions =
    activeCategory === 'All'
      ? MOCK_SUGGESTIONS
      : MOCK_SUGGESTIONS.filter((item) => item.tags.includes(activeCategory))

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#141414] p-6 sm:p-12">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#e4ff00]">
                <Sparkles className="h-3 w-3" />
                AI Powered Insights
              </div>
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#d7d7d7]">
                Coming Soon
              </div>
            </div>
            <h2 className="font-mono text-2xl font-black uppercase tracking-tighter text-[#f5f5f5] sm:text-4xl">
              Smart <span className="text-[#e4ff00]">Suggestions</span>
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-[#777]">
              This is a sneak peek of the personalized meal suggestions experience.
              The live AI recommendation flow is still being built.
            </p>
          </div>
          <div className="mt-2 flex items-center justify-center gap-3 self-start rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold uppercase tracking-widest text-[#888] md:mt-0 md:self-auto">
            <RotateCcw className="h-4 w-4" />
            Preview Only
          </div>
        </div>

        <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-3">
          <SuggestionTopCard
            icon={<Target className="h-4 w-4" />}
            label="Matched to goals"
            value="Planned"
            helper="Final AI suggestions will adapt to your goals and macro targets"
          />
          <SuggestionTopCard
            icon={<ChefHat className="h-4 w-4" />}
            label="Preview mode"
            value="Sample meals"
            helper="Current cards are a visual sneak peek, not live generated results"
          />
          <SuggestionTopCard
            icon={<Salad className="h-4 w-4" />}
            label="What is shown"
            value={`${filteredSuggestions.length} examples`}
            helper="Use the filters to explore the mock recommendation styles"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'High Protein', 'Low Carb', 'Plant-Based', 'Quick Fix', 'Budget Friendly'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all',
              activeCategory === cat
                ? 'border border-[#e4ff00]/20 bg-[#e4ff00] text-black'
                : 'border border-white/5 bg-[#141414] text-[#666] hover:border-white/10 hover:text-[#999]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredSuggestions.map((item) => (
          <div 
            key={item.id}
            className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/8 bg-[#111111] transition-all hover:-translate-y-0.5 hover:border-[#e4ff00]/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
          >
            <div className="relative overflow-hidden border-b border-white/5 bg-[#151515] p-5">
              <div className="absolute right-4 top-4 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                <Clock className="mr-1 inline-flex h-3 w-3 align-text-bottom" />
                {item.prepTime}
              </div>

              <div className="flex min-h-32 flex-col justify-between">
                <div className="flex items-start justify-between gap-3 pr-20">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#666]">
                      Sneak peek card
                    </div>
                    <h3 className="mt-3 text-xl font-bold leading-tight text-[#f5f5f5] transition-colors group-hover:text-[#e4ff00]">
                      {item.name}
                    </h3>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#737373]">{item.description}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.tags.map(tag => (
                  <span key={tag} className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#444]">Cals</div>
                  <div className="mt-1 font-mono text-sm font-black text-[#aaa]">{item.calories}</div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#444]">Prot</div>
                  <div className="mt-1 font-mono text-sm font-black text-[#aaa]">{item.protein}g</div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#444]">Carb</div>
                  <div className="mt-1 font-mono text-sm font-black text-[#aaa]">{item.carbs}g</div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#444]">Fat</div>
                  <div className="mt-1 font-mono text-sm font-black text-[#aaa]">{item.fat}g</div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#e4ff00]/10 bg-[#e4ff00]/[0.04] p-4">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#e4ff00]/70" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#777]">
                    Preview reasoning
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#686868]">
                    {item.reasoning}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button className="rounded-xl border border-white/10 py-3 text-[10px] font-black uppercase tracking-widest text-[#888] transition-all hover:bg-white/5 hover:text-white">
                  Learn More
                </button>
                <button
                  disabled
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1a1a1a] py-3 text-[10px] font-black uppercase tracking-widest text-[#666] opacity-70"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSuggestions.length === 0 ? (
        <SectionCard className="text-center">
          <div className="text-sm text-[#777]">
            No suggestions match this filter yet. Try switching back to <span className="text-[#f5f5f5]">All</span>.
          </div>
        </SectionCard>
      ) : null}
    </div>
  )
}

function SuggestionTopCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-[#e4ff00]">
        {icon}
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#777]">{label}</div>
      </div>
      <div className="mt-3 text-lg font-semibold text-[#f5f5f5]">{value}</div>
      <div className="mt-1 text-xs leading-relaxed text-[#6f6f6f]">{helper}</div>
    </div>
  )
}
