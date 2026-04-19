'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { Check, Download, Loader2, Save, Send, User, RefreshCw, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

import { SectionCard, cn } from '@/components/dashboard/ui'

type UnitSystem = 'metric' | 'imperial'
type AiModel = 'gemini-2.5-flash-lite' | 'gemini-2.5-flash'
type TelegramStatus = 'connected' | 'disconnected' | 'error'

export function SettingsSection() {
  const clerk = useClerk()
  const { isLoaded, user } = useUser()
  const [units, setUnits] = useState<UnitSystem>('metric')
  const [aiModel, setAiModel] = useState<AiModel>('gemini-2.5-flash-lite')
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true)
  const [isSavingPreferences, setIsSavingPreferences] = useState(false)
  const [isRegisteringWebhook, setIsRegisteringWebhook] = useState(false)
  const [isLoadingTelegram, setIsLoadingTelegram] = useState(true)
  const [telegramConnection, setTelegramConnection] = useState<{
    status: TelegramStatus
    username: string | null
    connectedAt: string | null
  }>({
    status: 'disconnected',
    username: null,
    connectedAt: null,
  })
  const [telegramWebhook, setTelegramWebhook] = useState<{
    configured: boolean
    registered: boolean
    expectedUrl: string | null
    lastErrorMessage: string | null
  }>({
    configured: false,
    registered: false,
    expectedUrl: null,
    lastErrorMessage: null,
  })

  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? null
  const fullNameFromParts =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || null
  const displayName =
    user?.fullName ?? fullNameFromParts ?? user?.username ?? 'Unnamed user'
  const memberSince = user?.createdAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(user.createdAt)
    : null

  useEffect(() => {
    let cancelled = false

    async function loadPreferences() {
      try {
        const response = await fetch('/api/settings/preferences', {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to load preferences')
        }

        const data = (await response.json()) as {
          preferences?: {
            unitSystem?: UnitSystem
            aiModel?: AiModel
          }
        }

        if (cancelled) {
          return
        }

        setUnits(data.preferences?.unitSystem ?? 'metric')
        setAiModel(data.preferences?.aiModel ?? 'gemini-2.5-flash-lite')
      } catch {
        if (!cancelled) {
          toast.error('Could not load your Nutrix preferences')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPreferences(false)
        }
      }
    }

    void loadPreferences()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadTelegramStatus() {
      try {
        const response = await fetch('/api/integrations/telegram', {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to load Telegram integration')
        }

        const data = (await response.json()) as {
          connection?: {
            status?: TelegramStatus
            username?: string | null
            connectedAt?: string | null
          }
          webhook?: {
            configured?: boolean
            registered?: boolean
            expectedUrl?: string | null
            lastErrorMessage?: string | null
          }
        }

        if (cancelled) {
          return
        }

        setTelegramConnection({
          status: data.connection?.status ?? 'disconnected',
          username: data.connection?.username ?? null,
          connectedAt: data.connection?.connectedAt ?? null,
        })
        setTelegramWebhook({
          configured: Boolean(data.webhook?.configured),
          registered: Boolean(data.webhook?.registered),
          expectedUrl: data.webhook?.expectedUrl ?? null,
          lastErrorMessage: data.webhook?.lastErrorMessage ?? null,
        })
      } catch {
        if (!cancelled) {
          toast.error('Could not load Telegram integration')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTelegram(false)
        }
      }
    }

    void loadTelegramStatus()

    return () => {
      cancelled = true
    }
  }, [])

  async function savePreferences() {
    setIsSavingPreferences(true)

    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          unitSystem: units,
          aiModel,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      toast.success('Preferences saved')
    } catch {
      toast.error('Could not save preferences')
    } finally {
      setIsSavingPreferences(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="mb-2 text-2xl text-[#f5f5f5]">Settings</h2>
        <p className="text-sm text-[#777]">Manage your account and preferences</p>
      </div>

      <SectionCard>
        <h3 className="mb-4 text-lg text-[#f5f5f5]">Account</h3>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#0a0a0a]">
            {isLoaded && user?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.imageUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-[#888]" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-[#f5f5f5]">
              {isLoaded ? displayName : 'Loading account...'}
            </div>
            <div className="text-sm text-[#777]">
              {isLoaded ? primaryEmail ?? 'No primary email found' : 'Fetching your Clerk profile'}
            </div>
            {isLoaded && memberSince ? (
              <div className="mt-1 text-xs uppercase tracking-wide text-[#666]">
                Member since {memberSince}
              </div>
            ) : null}
          </div>
          <button
            onClick={() => clerk.openUserProfile()}
            className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#888] transition-colors hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]"
          >
            Edit Profile
          </button>
        </div>
      </SectionCard>

      <SectionCard>
        <h3 className="mb-4 text-lg text-[#f5f5f5]">Telegram Integration</h3>
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#e4ff00]/10 p-2">
                    {telegramConnection.status === 'connected' ? (
                      <Check className="h-5 w-5 text-[#e4ff00]" />
                    ) : isLoadingTelegram ? (
                      <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
                    ) : (
                      <Send className="h-5 w-5 text-[#e4ff00]" />
                    )}
                  </span>
                  <div>
                    <div className="text-[#f5f5f5]">
                      {telegramConnection.status === 'connected'
                        ? 'Connected to Telegram'
                        : 'Telegram not linked yet'}
                    </div>
                    <div className="text-sm text-[#777]">
                      {telegramConnection.username
                        ? `@${telegramConnection.username}`
                        : 'Connect your Telegram bot chat to log meals from messages.'}
                    </div>
                  </div>
                </div>
                {telegramConnection.connectedAt ? (
                  <div className="text-xs uppercase tracking-wide text-[#666]">
                    Connected {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(new Date(telegramConnection.connectedAt))}
                  </div>
                ) : null}
              </div>
              <div
                className={cn(
                  'rounded-full border px-3 py-1 text-xs uppercase tracking-wide',
                  telegramConnection.status === 'connected'
                    ? 'border-[#e4ff00]/30 bg-[#e4ff00]/10 text-[#e4ff00]'
                    : 'border-white/10 bg-[#141414] text-[#888]',
                )}
              >
                {telegramConnection.status}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[#f5f5f5]">Webhook</div>
                <div className="mt-1 text-sm text-[#777]">
                  {telegramWebhook.configured
                    ? telegramWebhook.registered
                      ? 'Telegram is pointed at your Nutrix webhook route.'
                      : 'Register the bot webhook so Telegram can deliver messages to Nutrix.'
                    : 'Set TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, and NEXT_PUBLIC_APP_URL first.'}
                </div>
                {telegramWebhook.expectedUrl ? (
                  <div className="mt-2 break-all text-xs text-[#666]">
                    {telegramWebhook.expectedUrl}
                  </div>
                ) : null}
                {telegramWebhook.lastErrorMessage ? (
                  <div className="mt-2 text-xs text-red-300">
                    {telegramWebhook.lastErrorMessage}
                  </div>
                ) : null}
              </div>
              <div
                className={cn(
                  'rounded-full border px-3 py-1 text-xs uppercase tracking-wide',
                  telegramWebhook.registered
                    ? 'border-[#e4ff00]/30 bg-[#e4ff00]/10 text-[#e4ff00]'
                    : 'border-white/10 bg-[#141414] text-[#888]',
                )}
              >
                {telegramWebhook.registered ? 'registered' : 'not registered'}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              onClick={() => {
                window.open('/api/integrations/telegram/start', '_blank')
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d]"
            >
              <ExternalLink className="h-4 w-4" />
              Connect Telegram
            </button>
            <button
              onClick={() => {
                setIsRegisteringWebhook(true)
                window.location.href = '/api/integrations/telegram/webhook/register'
              }}
              disabled={isRegisteringWebhook}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] transition-colors hover:border-[#e4ff00]/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRegisteringWebhook ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRegisteringWebhook ? 'Registering...' : 'Register Webhook'}
            </button>
          </div>
        </div>
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
                  disabled={isLoadingPreferences || isSavingPreferences}
                >
                  {unit[0].toUpperCase() + unit.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 border-t border-white/10 pt-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[#f5f5f5]">AI Model</div>
              <div className="text-sm text-[#777]">
                Choose the Gemini model used for AI meal parsing.
              </div>
            </div>
            <select
              value={aiModel}
              onChange={(event) => setAiModel(event.target.value as AiModel)}
              disabled={isLoadingPreferences || isSavingPreferences}
              className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none focus:border-[#e4ff00] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            </select>
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
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => void savePreferences()}
              disabled={isLoadingPreferences || isSavingPreferences}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingPreferences ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoadingPreferences
                ? 'Loading Preferences'
                : isSavingPreferences
                  ? 'Saving Preferences'
                  : 'Save Preferences'}
            </button>
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
         
        </div>
      </SectionCard>
    </div>
  )
}
