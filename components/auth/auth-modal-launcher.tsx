'use client'

import { SignInButton, SignUpButton, useClerk } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

type AuthModalLauncherProps = {
  mode: 'sign-in' | 'sign-up'
}

export function AuthModalLauncher({ mode }: AuthModalLauncherProps) {
  const clerk = useClerk()
  const openedRef = useRef(false)

  useEffect(() => {
    if (openedRef.current) {
      return
    }

    openedRef.current = true

    if (mode === 'sign-in') {
      clerk.openSignIn({
        forceRedirectUrl: '/dashboard',
        signUpForceRedirectUrl: '/dashboard',
      })
      return
    }

    clerk.openSignUp({
      forceRedirectUrl: '/dashboard',
      signInForceRedirectUrl: '/dashboard',
    })
  }, [clerk, mode])

  const title = mode === 'sign-in' ? 'Welcome back' : 'Create your account'
  const description =
    mode === 'sign-in'
      ? 'Sign in to continue to your Nutrix dashboard.'
      : 'Create a Nutrix account and start tracking.'
  const cta = mode === 'sign-in' ? 'Open sign in' : 'Open sign up'
  const alternateHref = mode === 'sign-in' ? '/register' : '/login'
  const alternateLabel =
    mode === 'sign-in' ? 'Need an account? Sign up' : 'Already have an account? Sign in'

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 text-white selection:bg-[#e4ff00] selection:text-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(228,255,0,0.12),transparent_30%),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:auto,56px_56px,56px_56px]" />

      <div className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#111111]/92 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-mono text-4xl font-black uppercase tracking-tighter text-[#f5f5f5]"
          >
            NUTR<span className="text-[#e4ff00]">IX</span>
          </Link>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-[#8b8b8b]">{description}</p>
        </div>

       

        <div className="mt-6">
          {mode === 'sign-in' ? (
            <SignInButton
              mode="modal"
              forceRedirectUrl="/dashboard"
              signUpForceRedirectUrl="/dashboard"
            >
              <Button className="group h-14 w-full rounded-2xl bg-[#e4ff00] text-base font-bold text-black hover:bg-[#f0ff4d]">
                <span className="flex items-center gap-2">
                  {cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </SignInButton>
          ) : (
            <SignUpButton
              mode="modal"
              forceRedirectUrl="/dashboard"
              signInForceRedirectUrl="/dashboard"
            >
              <Button className="group h-14 w-full rounded-2xl bg-[#e4ff00] text-base font-bold text-black hover:bg-[#f0ff4d]">
                <span className="flex items-center gap-2">
                  {cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </SignUpButton>
          )}
        </div>

        <div className="mt-6 border-t border-white/10 pt-6 text-center">
          <Link href={alternateHref} className="text-sm text-[#888] transition-colors hover:text-white">
            {alternateLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
