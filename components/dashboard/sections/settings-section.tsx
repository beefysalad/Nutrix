'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useClerk, useUser } from '@clerk/nextjs'
import {
  Check,
  Download,
  ExternalLink,
  Loader2,
  Save,
  Send,
  User,
} from 'lucide-react'
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
import { Button } from '@/components/ui/button'

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
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    null
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
        toast.warning(
          'Preferences saved, but AI model persistence is waiting on the DB migration'
        )
        return
      }

      toast.success('Preferences saved')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not save preferences'))
    }
  }

  const telegramConnection = telegramQuery.data?.connection
  const telegramWebhook = telegramQuery.data?.webhook
  const isTelegramConnected = telegramConnection?.status === 'connected'
  const isWebhookConfigured = Boolean(telegramWebhook?.configured)
  const telegramSetupState = !isWebhookConfigured
    ? 'Bot setup unavailable'
    : !isTelegramConnected
      ? 'Connect'
      : 'Ready'

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
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="mb-2 text-2xl text-[#f5f5f5]">Settings</h2>
        <p className="text-sm text-[#777]">
          Manage your account and preferences
        </p>
      </div>

      <div>
        <h3 className="mb-4 text-lg text-[#f5f5f5]">Account</h3>
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#141414]">
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
                <div className="text-lg text-[#f5f5f5]">
                  {isLoaded ? displayName : 'Loading account...'}
                </div>
                <div className="text-sm text-[#777]">
                  {isLoaded
                    ? (primaryEmail ?? 'No primary email found')
                    : 'Fetching your Clerk profile'}
                </div>
                {isLoaded && memberSince ? (
                  <div className="mt-2 text-[11px] tracking-widest text-[#666] uppercase">
                    Member since {memberSince}
                  </div>
                ) : null}
              </div>
            </div>
            <Button
              onClick={() => clerk.openUserProfile()}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm font-medium text-[#f5f5f5] transition-colors hover:border-[#e4ff00]/50 hover:bg-[#1a1a1a] hover:text-[#e4ff00] md:mt-0 md:w-auto"
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg text-[#f5f5f5]">Telegram Integration</h3>
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-lg text-[#f5f5f5]">Telegram Bot</div>
                    <div className="text-sm text-[#777]">
                      {telegramSetupState}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TelegramStatusTile
                    title="Chat Connection"
                    status={isTelegramConnected ? 'Connected' : 'Not connected'}
                    tone={isTelegramConnected ? 'success' : 'default'}
                    body={
                      telegramConnection?.username
                        ? `Linked with @${telegramConnection.username}`
                        : 'Link your Telegram chat so meals sent to the bot can sync into Nutrix.'
                    }
                    footer={
                      telegramConnection?.connectedAt
                        ? `Connected ${new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }).format(new Date(telegramConnection.connectedAt))}`
                        : 'Step 1 of 2'
                    }
                  />
                  <TelegramStatusTile
                    title="Meal Logging"
                    status={isWebhookConfigured ? 'Available' : 'Unavailable'}
                    tone={isWebhookConfigured ? 'success' : 'default'}
                    body={
                      isWebhookConfigured
                        ? 'Once connected, send meals to the Nutrix bot and they will sync into your dashboard.'
                        : 'Telegram logging is being configured by the Nutrix admin.'
                    }
                    footer={
                      isWebhookConfigured
                        ? 'No extra setup needed'
                        : 'Please try again later'
                    }
                  />
                </div>
              </div>
            </div>

            {!isWebhookConfigured ? (
              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-100">
                Telegram bot setup is not available yet. No action is needed
                from your account.
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
            <div className="text-lg text-[#f5f5f5]">Quick Setup</div>
            <div className="mt-1 text-sm text-[#777]">
              Follow these steps to start logging meals from Telegram.
            </div>
            <div className="mt-6 space-y-4 text-sm">
              <div className="border-b border-white/10 pb-4 text-[#aaa] last:border-b-0 md:rounded-2xl md:border md:bg-[#141414] md:p-5">
                1. Search for{' '}
                <span className="font-mono text-[#f5f5f5]">@NutrrixBot</span> in
                Telegram, then start the connection flow.
              </div>
              <div className="border-b border-white/10 pb-4 text-[#aaa] last:border-b-0 md:rounded-2xl md:border md:bg-[#141414] md:p-5">
                2. Send a meal message like{' '}
                <span className="font-mono text-[#f5f5f5]">
                  2 eggs and rice
                </span>{' '}
                to test it.
              </div>
            </div>
          </div>

          <div>
            <Button
              type="button"
              disabled={!isWebhookConfigured}
              onClick={() => {
                window.open(
                  '/api/integrations/telegram/start',
                  '_blank',
                  'noopener,noreferrer'
                )
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ExternalLink className="h-4 w-4" />
              {isTelegramConnected ? 'Reconnect Telegram' : 'Connect Telegram'}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg text-[#f5f5f5]">Preferences</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[#f5f5f5]">Units</div>
                <div className="mt-1 text-sm text-[#777]">
                  Metric or imperial measurements
                </div>
              </div>
              <div className="flex gap-2">
                {(['metric', 'imperial'] as const).map((unit) => (
                  <Button
                    key={unit}
                    type="button"
                    onClick={() =>
                      setValue('unitSystem', unit, { shouldDirty: true })
                    }
                    className={cn(
                      'rounded-xl border px-5 py-2.5 text-sm transition-colors',
                      selectedUnitSystem === unit
                        ? 'border-[#e4ff00] bg-[#e4ff00] text-[#0a0a0a] hover:bg-[#f0ff4d]'
                        : 'border-white/10 bg-[#141414] text-[#888] hover:border-[#e4ff00]/50 hover:text-[#f5f5f5]'
                    )}
                    disabled={preferencesQuery.isLoading || isSubmitting}
                  >
                    {unit[0].toUpperCase() + unit.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[#f5f5f5]">AI Model</div>
                <div className="mt-1 text-sm text-[#777]">
                  Choose the Gemini model used for AI meal parsing.
                </div>
              </div>
              <select
                {...register('aiModel')}
                disabled={preferencesQuery.isLoading || isSubmitting}
                className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-[#f5f5f5] transition-colors outline-none focus:border-[#e4ff00] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                <option value="gemini-2.5-flash-lite">
                  Gemini 2.5 Flash-Lite
                </option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              </select>
            </div>

            <div className="mt-6 flex flex-col gap-6 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[#f5f5f5]">Language</div>
                <div className="mt-1 text-sm text-[#777]">
                  Interface language
                </div>
              </div>
              <select
                {...register('language')}
                className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-[#f5f5f5] transition-colors outline-none focus:border-[#e4ff00] md:w-auto"
              >
                <option value="English">English</option>
              </select>
            </div>
          </div>

          {errors.aiModel || errors.unitSystem || errors.language ? (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
              {errors.aiModel?.message ||
                errors.unitSystem?.message ||
                errors.language?.message}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={
              preferencesQuery.isLoading ||
              isSubmitting ||
              savePreferencesMutation.isPending
            }
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
          </Button>
        </form>
      </div>

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
              JSON includes profile, goals, reports, integrations, and meals.
              CSV exports meal items in spreadsheet-friendly rows.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TelegramStatusTile({
  title,
  status,
  body,
  footer,
  tone,
}: {
  title: string
  status: string
  body: string
  footer: string
  tone: 'success' | 'warning' | 'default'
}) {
  return (
    <div className="border-b border-white/10 py-5 last:border-b-0 sm:rounded-2xl sm:border sm:bg-[#141414] sm:p-5 sm:last:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[#f5f5f5]">{title}</div>
        <div
          className={cn(
            'rounded-full border px-2.5 py-1 text-[10px] tracking-wide uppercase',
            tone === 'success'
              ? 'border-[#e4ff00]/30 bg-[#e4ff00]/10 text-[#e4ff00]'
              : tone === 'warning'
                ? 'border-amber-400/20 bg-amber-400/10 text-amber-300'
                : 'border-white/10 bg-[#101010] text-[#888]'
          )}
        >
          {status}
        </div>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-[#777]">{body}</div>
      <div className="mt-4 text-[11px] tracking-wide text-[#666] uppercase">
        {footer}
      </div>
    </div>
  )
}
