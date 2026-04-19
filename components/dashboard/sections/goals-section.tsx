'use client'

import { useState } from 'react'

import { dietModes } from '@/components/dashboard/data'
import { SectionCard, cn } from '@/components/dashboard/ui'

export function GoalsSection() {
  const [selectedMode, setSelectedMode] = useState('cutting')
  const [showTdee, setShowTdee] = useState(false)
  const [telegramReminders, setTelegramReminders] = useState(false)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="mb-2 text-2xl text-[#f5f5f5]">Nutrition Goals</h2>
        <p className="text-sm text-[#777]">Set your daily targets and preferences</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {dietModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setSelectedMode(mode.id)}
            className={cn(
              'rounded-2xl border-2 p-5 text-left transition-all',
              selectedMode === mode.id
                ? 'border-[#e4ff00] bg-[#e4ff00]/5'
                : 'border-white/10 bg-[#141414] hover:border-[#e4ff00]/30',
            )}
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="text-[#f5f5f5]">{mode.label}</h3>
              {selectedMode === mode.id ? (
                <span className="rounded-full bg-[#e4ff00] p-1 text-[10px] font-bold text-[#0a0a0a]">OK</span>
              ) : null}
            </div>
            <p className="text-sm text-[#777]">{mode.description}</p>
          </button>
        ))}
      </div>

      <SectionCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg text-[#f5f5f5]">Daily Targets</h3>
          <button
            onClick={() => setShowTdee((value) => !value)}
            className="rounded-full border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-sm text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-[#e4ff00]"
          >
            {showTdee ? 'Hide TDEE' : 'TDEE Calculator'}
          </button>
        </div>

        {showTdee ? (
          <div className="mb-6 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
            <div className="grid gap-3 md:grid-cols-2">
              {['Age', 'Weight (kg)', 'Height (cm)'].map((field) => (
                <input
                  key={field}
                  type="number"
                  placeholder={field}
                  className="rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
                />
              ))}
              <select className="rounded-2xl border border-white/10 bg-[#141414] px-4 py-3 text-[#f5f5f5] outline-none focus:border-[#e4ff00]">
                <option>Sedentary</option>
                <option>Lightly Active</option>
                <option>Moderately Active</option>
                <option>Very Active</option>
              </select>
            </div>
            <button className="mt-3 w-full rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d]">
              Calculate & Apply
            </button>
          </div>
        ) : null}

        <div className="space-y-4">
          <input
            type="number"
            placeholder="Daily calories"
            className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 font-mono text-[#f5f5f5] outline-none focus:border-[#e4ff00]"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {['Protein (g)', 'Carbs (g)', 'Fat (g)'].map((value, index) => (
              <input
                key={`${value}-${index}`}
                type="number"
                placeholder={value}
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 font-mono text-[#f5f5f5] outline-none focus:border-[#e4ff00]"
              />
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <h3 className="mb-4 text-lg text-[#f5f5f5]">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[#f5f5f5]">Daily Report Time</div>
              <div className="text-sm text-[#777]">Get your daily summary</div>
            </div>
            <input
              type="time"
              className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 font-mono text-[#f5f5f5] outline-none focus:border-[#e4ff00]"
            />
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div>
              <div className="text-[#f5f5f5]">Telegram Reminders</div>
              <div className="text-sm text-[#777]">Log meals via Telegram bot</div>
            </div>
            <button
              onClick={() => setTelegramReminders((value) => !value)}
              className={cn(
                'relative h-7 w-14 rounded-full transition-colors',
                telegramReminders ? 'bg-[#e4ff00]' : 'bg-white/10',
              )}
            >
              <span
                className={cn(
                  'absolute top-1 h-5 w-5 rounded-full bg-[#0a0a0a] transition-transform',
                  telegramReminders ? 'translate-x-8' : 'translate-x-1',
                )}
              />
            </button>
          </div>
        </div>
      </SectionCard>

      <button className="w-full rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d]">
        Save Goals
      </button>
    </div>
  )
}
