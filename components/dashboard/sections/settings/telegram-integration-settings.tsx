'use client'

import { ExternalLink } from 'lucide-react'

import { cn } from '@/components/dashboard/ui'
import { Button } from '@/components/ui/button'
import { type useTelegramIntegrationQuery } from '@/hooks/dashboard'

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

export function TelegramIntegrationSettings({
  telegramQuery,
}: {
  telegramQuery: ReturnType<typeof useTelegramIntegrationQuery>
}) {
  const telegramConnection = telegramQuery.data?.connection
  const telegramWebhook = telegramQuery.data?.webhook
  const isTelegramConnected = telegramConnection?.status === 'connected'
  const isWebhookConfigured = Boolean(telegramWebhook?.configured)
  const telegramSetupState = !isWebhookConfigured
    ? 'Bot setup unavailable'
    : !isTelegramConnected
      ? 'Connect'
      : 'Ready'

  return (
    <div>
      <h3 className="mb-4 text-lg text-[#f5f5f5]">Telegram Integration</h3>
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-lg text-[#f5f5f5]">Telegram Bot</div>
                  <div className="text-sm text-[#777]">{telegramSetupState}</div>
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
  )
}
