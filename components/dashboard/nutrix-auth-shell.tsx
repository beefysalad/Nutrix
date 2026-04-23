import Link from 'next/link'
import { Mail } from 'lucide-react'

import type { AuthMode } from '@/components/dashboard/types'
import { Button } from '@/components/ui/button'

export function NutrixAuthShell({ mode }: { mode: AuthMode }) {
  const title = mode === 'sign-in' ? 'Welcome back' : 'Create account'
  const cta = mode === 'sign-in' ? 'Continue to sign in' : 'Continue to sign up'
  const alternateHref = mode === 'sign-in' ? '/register' : '/login'
  const alternateLabel = mode === 'sign-in' ? 'Create an account' : 'Back to sign in'

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,222,128,0.14),transparent_40%),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:auto,40px_40px,40px_40px]" />
      <div className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#141414]/90 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <h1 className="font-mono text-4xl text-[#f5f5f5]">
            Nut<span className="text-[#e4ff00]">rix</span>
          </h1>
          <p className="mt-3 text-sm text-[#777]">{title}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-[#f5f5f5]">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] py-3 pl-11 pr-4 text-[#f5f5f5] outline-none placeholder:text-[#666] focus:border-[#e4ff00]"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#e4ff00]/20 bg-[#e4ff00]/8 p-4 text-sm text-[#f3ff8a]">
            Clerk will open its modal automatically, and you can also launch it manually below.
          </div>

          <Link
            href={alternateHref}
            className="block text-center text-sm text-[#888] transition-colors hover:text-[#f5f5f5]"
          >
            {alternateLabel}
          </Link>

          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 text-center text-sm text-[#777]">
            Use Google or email in the Clerk modal to continue.
          </div>

          <div className="flex items-center gap-3 text-[#555]">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-[0.24em]">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <Button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-[#f5f5f5] transition-colors hover:border-[#e4ff00]/40 hover:bg-white/[0.02]">
            <Mail className="h-4 w-4" />
            {cta}
          </Button>
        </div>
      </div>
    </div>
  )
}
