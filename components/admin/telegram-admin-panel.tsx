'use client'

import { Check, Loader2, Lock, RefreshCw, Shield, XCircle } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type TelegramAdminStatus = {
  configured: boolean
  expectedUrl: string | null
  registeredUrl: string | null
  registered: boolean
  pendingUpdateCount: number | null
  lastErrorMessage: string | null
}

type AuthState = 'checking' | 'locked' | 'unlocked'

export function TelegramAdminPanel() {
  const [authState, setAuthState] = useState<AuthState>('checking')
  const [password, setPassword] = useState('')
  const [telegram, setTelegram] = useState<TelegramAdminStatus | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  async function loadStatus() {
    const response = await fetch('/api/admin/telegram', {
      cache: 'no-store',
    })

    if (response.status === 401) {
      setAuthState('locked')
      return
    }

    if (!response.ok) {
      throw new Error('Could not load admin status')
    }

    const data = (await response.json()) as { telegram: TelegramAdminStatus }
    setTelegram(data.telegram)
    setAuthState('unlocked')
  }

  useEffect(() => {
    void loadStatus().catch(() => {
      setAuthState('locked')
    })
  }, [])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(data?.error ?? 'Invalid admin password')
      }

      setPassword('')
      await loadStatus()
      toast.success('Admin unlocked')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not unlock admin')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    setTelegram(null)
    setAuthState('locked')
  }

  async function handleRegisterWebhook() {
    setIsRegistering(true)

    try {
      const response = await fetch('/api/admin/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register-webhook' }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(data?.error ?? 'Could not register webhook')
      }

      const data = (await response.json()) as { telegram: TelegramAdminStatus }
      setTelegram(data.telegram)
      toast.success('Telegram webhook registered')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not register webhook',
      )
    } finally {
      setIsRegistering(false)
    }
  }

  if (authState === 'checking') {
    return (
      <AdminShell>
        <div className="flex min-h-[360px] items-center justify-center rounded-[2rem] border border-white/10 bg-[#111111]">
          <Loader2 className="h-5 w-5 animate-spin text-[#e4ff00]" />
        </div>
      </AdminShell>
    )
  }

  if (authState === 'locked') {
    return (
      <AdminShell>
        <form
          onSubmit={handleLogin}
          className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-[#111111] p-6 shadow-2xl sm:p-8"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e4ff00] text-black">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-5 font-mono text-3xl font-black tracking-tighter text-[#f5f5f5] uppercase">
            Admin Access
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#777]">
            Hidden Nutrix controls live here. Use the admin password from
            <span className="font-mono text-[#d7d7d7]"> NUTRIX_ADMIN_PASSWORD</span>.
          </p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Admin password"
            className="mt-6 w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] outline-none transition-colors placeholder:text-[#555] focus:border-[#e4ff00]"
          />
          <button
            type="submit"
            disabled={isSubmitting || !password}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3 font-bold text-black transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Unlock Admin
          </button>
        </form>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[#111111] p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/10 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-[#e4ff00] uppercase">
              <Shield className="h-3.5 w-3.5" />
              Secret Admin
            </div>
            <h1 className="mt-4 font-mono text-3xl font-black tracking-tighter text-[#f5f5f5] uppercase sm:text-4xl">
              Telegram Controls
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#777]">
              Webhook setup is an owner-only task. Normal users should only
              connect their Telegram chat from Settings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="self-start rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-2.5 text-sm text-[#aaa] transition-colors hover:border-white/20 hover:text-[#f5f5f5]"
          >
            Lock
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatusCard
            label="Environment"
            value={telegram?.configured ? 'Configured' : 'Missing env'}
            ok={Boolean(telegram?.configured)}
          />
          <StatusCard
            label="Webhook"
            value={telegram?.registered ? 'Registered' : 'Not registered'}
            ok={Boolean(telegram?.registered)}
          />
          <StatusCard
            label="Pending updates"
            value={`${telegram?.pendingUpdateCount ?? 0}`}
            ok={(telegram?.pendingUpdateCount ?? 0) === 0}
          />
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg text-[#f5f5f5]">Webhook registration</h2>
              <p className="mt-1 text-sm text-[#777]">
                Register this after deploying or changing your app URL.
              </p>
            </div>
            <button
              type="button"
              disabled={!telegram?.configured || isRegistering}
              onClick={() => void handleRegisterWebhook()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#e4ff00] px-4 py-3 font-bold text-black transition-colors hover:bg-[#f0ff4d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRegistering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {telegram?.registered ? 'Re-register Webhook' : 'Register Webhook'}
            </button>
          </div>

          <div className="mt-5 space-y-3">
            <UrlRow label="Expected URL" value={telegram?.expectedUrl} />
            <UrlRow label="Registered URL" value={telegram?.registeredUrl} />
          </div>

          {telegram?.lastErrorMessage ? (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
              {telegram.lastErrorMessage}
            </div>
          ) : null}
        </div>
      </div>
    </AdminShell>
  )
}

function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">{children}</div>
    </main>
  )
}

function StatusCard({
  label,
  value,
  ok,
}: {
  label: string
  value: string
  ok: boolean
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#111111] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-black tracking-[0.2em] text-[#666] uppercase">
          {label}
        </div>
        {ok ? (
          <Check className="h-4 w-4 text-[#e4ff00]" />
        ) : (
          <XCircle className="h-4 w-4 text-amber-300" />
        )}
      </div>
      <div className="mt-4 text-xl font-bold text-[#f5f5f5]">{value}</div>
    </div>
  )
}

function UrlRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
      <div className="text-[10px] font-black tracking-[0.2em] text-[#666] uppercase">
        {label}
      </div>
      <div className="mt-2 break-all font-mono text-xs text-[#aaa]">
        {value ?? 'Not available'}
      </div>
    </div>
  )
}
