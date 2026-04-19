'use client'

import { useState } from 'react'
import { Check, Download, Send, User } from 'lucide-react'

import { SectionCard, cn } from '@/components/dashboard/ui'

export function SettingsSection() {
  const [telegramConnected, setTelegramConnected] = useState(false)
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric')

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="mb-2 text-2xl text-[#f5f5f5]">Settings</h2>
        <p className="text-sm text-[#777]">Manage your account and preferences</p>
      </div>

      <SectionCard>
        <h3 className="mb-4 text-lg text-[#f5f5f5]">Account</h3>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#0a0a0a]">
            <User className="h-8 w-8 text-[#888]" />
          </div>
          <div className="flex-1">
            <div className="text-[#f5f5f5]">Signed in via Clerk</div>
            <div className="text-sm text-[#777]">Profile details will be sourced from the authenticated user instead of mocked sample data.</div>
          </div>
          <button className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]">
            Edit Profile
          </button>
        </div>
      </SectionCard>

      <SectionCard>
        <h3 className="mb-4 text-lg text-[#f5f5f5]">Telegram Integration</h3>
        {telegramConnected ? (
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#e4ff00]/10 p-2">
                <Check className="h-5 w-5 text-[#e4ff00]" />
              </span>
              <div>
                <div className="text-[#f5f5f5]">Connected to Telegram</div>
                <div className="text-sm text-[#777]">@johndoe</div>
              </div>
            </div>
            <button
              onClick={() => setTelegramConnected(false)}
              className="rounded-2xl border border-red-400 px-4 py-2 text-red-400 transition-colors hover:bg-red-400 hover:text-white"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#777]">
              Connect your Telegram account to log meals via bot and receive daily reports.
            </p>
            <button
              onClick={() => setTelegramConnected(true)}
              className="flex items-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d]"
            >
              <Send className="h-4 w-4" />
              Connect Telegram
            </button>
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <h3 className="mb-4 text-lg text-[#f5f5f5]">Preferences</h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[#f5f5f5]">Units</div>
              <div className="text-sm text-[#777]">Metric or imperial measurements</div>
            </div>
            <div className="flex gap-2">
              {(['metric', 'imperial'] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() => setUnits(unit)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm transition-colors',
                    units === unit
                      ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                      : 'border-white/10 bg-[#0a0a0a] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]',
                  )}
                >
                  {unit[0].toUpperCase() + unit.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 border-t border-white/10 pt-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[#f5f5f5]">Language</div>
              <div className="text-sm text-[#777]">Interface language</div>
            </div>
            <select className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none focus:border-[#e4ff00]">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <h3 className="mb-4 text-lg text-[#f5f5f5]">Data</h3>
        <div className="space-y-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] transition-colors hover:border-[#e4ff00]/50">
            <Download className="h-4 w-4" />
            Export Data (CSV/JSON)
          </button>
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400 px-4 py-3 text-red-400 transition-colors hover:bg-red-400 hover:text-white">
            Delete Account
          </button>
        </div>
      </SectionCard>
    </div>
  )
}
