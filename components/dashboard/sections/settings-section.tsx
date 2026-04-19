'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useClerk, useUser } from '@clerk/nextjs'
import { Check, Download, ExternalLink, Loader2, RefreshCw, Save, Send, User } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import {
  getApiErrorMessage,
  useExportDataMutation,
  usePreferencesQuery,
  useSavePreferencesMutation,
  useTelegramIntegrationQuery,
} from '@/lib/hooks/use-dashboard-api'
import {
  settingsFormSchema,
  type SettingsFormValues,
} from '@/lib/validations/dashboard-forms'
import { SectionCard, cn } from '@/components/dashboard/ui'

export function SettingsSection() {
  const clerk = useClerk()
  const { isLoaded, user } = useUser()
  const preferencesQuery = usePreferencesQuery()
  const telegramQuery = useTelegramIntegrationQuery()
  const savePreferencesMutation = useSavePreferencesMutation()
  const exportDataMutation = useExportDataMutation()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      unitSystem: 'metric',
      aiModel: 'gemini-2.5-flash-lite',
      language: 'English',
    },
  })

  const selectedUnitSystem = useWatch({ control, name: 'unitSystem' })

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
    if (!preferencesQuery.data?.preferences) {
      return
    }

    reset({
      unitSystem: preferencesQuery.data.preferences.unitSystem,
      aiModel: preferencesQuery.data.preferences.aiModel,
      language: 'English',
    })
  }, [preferencesQuery.data, reset])

  async function onSubmit(values: SettingsFormValues) {
    try {
      const response = await savePreferencesMutation.mutateAsync({
        unitSystem: values.unitSystem,
        aiModel: values.aiModel,
      })

      if (response.preferences.aiModelPersistencePendingMigration) {
        toast.warning('Preferences saved, but AI model persistence is waiting on the DB migration')
        return
      }

      toast.success('Preferences saved')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not save preferences'))
    }
  }

  const telegramConnection = telegramQuery.data?.connection
  const telegramWebhook = telegramQuery.data?.webhook

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
      toast.error(getApiErrorMessage(error, `Could not export ${format.toUpperCase()} data`))
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
              <img src={user.imageUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-[#888]" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-[#f5f5f5]">{isLoaded ? displayName : 'Loading account...'}</div>
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
                    {telegramConnection?.status === 'connected' ? (
                      <Check className="h-5 w-5 text-[#e4ff00]" />
                    ) : telegramQuery.isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
                    ) : (
                      <Send className="h-5 w-5 text-[#e4ff00]" />
                    )}
                  </span>
                  <div>
                    <div className="text-[#f5f5f5]">
                      {telegramConnection?.status === 'connected'
                        ? 'Connected to Telegram'
                        : 'Telegram not linked yet'}
                    </div>
                    <div className="text-sm text-[#777]">
                      {telegramConnection?.username
                        ? `@${telegramConnection.username}`
                        : 'Connect your Telegram bot chat to log meals from messages.'}
                    </div>
                  </div>
                </div>
                {telegramConnection?.connectedAt ? (
                  <div className="text-xs uppercase tracking-wide text-[#666]">
                    Connected{' '}
                    {new Intl.DateTimeFormat('en-US', {
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
                  telegramConnection?.status === 'connected'
                    ? 'border-[#e4ff00]/30 bg-[#e4ff00]/10 text-[#e4ff00]'
                    : 'border-white/10 bg-[#141414] text-[#888]',
                )}
              >
                {telegramConnection?.status ?? 'disconnected'}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[#f5f5f5]">Webhook</div>
                <div className="mt-1 text-sm text-[#777]">
                  {telegramWebhook?.configured
                    ? telegramWebhook.registered
                      ? 'Telegram is pointed at your Nutrix webhook route.'
                      : 'Register the bot webhook so Telegram can deliver messages to Nutrix.'
                    : 'Set TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, and NEXT_PUBLIC_APP_URL first.'}
                </div>
                {telegramWebhook?.expectedUrl ? (
                  <div className="mt-2 break-all text-xs text-[#666]">
                    {telegramWebhook.expectedUrl}
                  </div>
                ) : null}
                {telegramWebhook?.lastErrorMessage ? (
                  <div className="mt-2 text-xs text-red-300">{telegramWebhook.lastErrorMessage}</div>
                ) : null}
              </div>
              <div
                className={cn(
                  'rounded-full border px-3 py-1 text-xs uppercase tracking-wide',
                  telegramWebhook?.registered
                    ? 'border-[#e4ff00]/30 bg-[#e4ff00]/10 text-[#e4ff00]'
                    : 'border-white/10 bg-[#141414] text-[#888]',
                )}
              >
                {telegramWebhook?.registered ? 'registered' : 'not registered'}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              onClick={() => {
                window.location.href = '/api/integrations/telegram/start'
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d]"
            >
              <ExternalLink className="h-4 w-4" />
              Connect Telegram
            </button>
            <button
              onClick={() => {
                window.location.href = '/api/integrations/telegram/webhook/register'
              }}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] transition-colors hover:border-[#e4ff00]/50"
            >
              <RefreshCw className="h-4 w-4" />
              Register Webhook
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <h3 className="mb-4 text-lg text-[#f5f5f5]">Preferences</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[#f5f5f5]">Units</div>
              <div className="text-sm text-[#777]">Metric or imperial measurements</div>
            </div>
            <div className="flex gap-2">
              {(['metric', 'imperial'] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setValue('unitSystem', unit, { shouldDirty: true })}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm transition-colors',
                    selectedUnitSystem === unit
                      ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a]'
                      : 'border-white/10 bg-[#0a0a0a] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]',
                  )}
                  disabled={preferencesQuery.isLoading || isSubmitting}
                >
                  {unit[0].toUpperCase() + unit.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 pt-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[#f5f5f5]">AI Model</div>
              <div className="text-sm text-[#777]">Choose the Gemini model used for AI meal parsing.</div>
            </div>
            <select
              {...register('aiModel')}
              disabled={preferencesQuery.isLoading || isSubmitting}
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
            <select
              {...register('language')}
              className="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none focus:border-[#e4ff00]"
            >
              <option value="English">English</option>
            </select>
          </div>

          {errors.aiModel || errors.unitSystem || errors.language ? (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
              {errors.aiModel?.message || errors.unitSystem?.message || errors.language?.message}
            </div>
          ) : null}

          <div className="border-t border-white/10 pt-4">
            <button
              type="submit"
              disabled={preferencesQuery.isLoading || isSubmitting || savePreferencesMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting || savePreferencesMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {preferencesQuery.isLoading
                ? 'Loading Preferences'
                : isSubmitting || savePreferencesMutation.isPending
                  ? 'Saving Preferences'
                  : 'Save Preferences'}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard>
        <h3 className="mb-4 text-lg text-[#f5f5f5]">Data</h3>
        <div className="space-y-3">
          <div className="text-sm text-[#777]">
            Export your Nutrix data as a full JSON archive or a flat meals CSV for spreadsheets.
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              disabled={exportDataMutation.isPending}
              onClick={() => void downloadExport('json')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] transition-colors hover:border-[#e4ff00]/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportDataMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export JSON Archive
            </button>
            <button
              type="button"
              disabled={exportDataMutation.isPending}
              onClick={() => void downloadExport('csv')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] transition-colors hover:border-[#e4ff00]/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportDataMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Meals CSV
            </button>
          </div>
          <div className="text-xs text-[#666]">
            JSON includes profile, goals, reports, integrations, and meals. CSV exports meal items in spreadsheet-friendly rows.
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
