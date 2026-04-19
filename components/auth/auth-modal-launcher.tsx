'use client'

import { SignInButton, SignUpButton, useClerk } from '@clerk/nextjs'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
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

  const title = mode === 'sign-in' ? 'Welcome Back' : 'Create Account'
  const cta = mode === 'sign-in' ? 'Open Sign-In Portal' : 'Open Registration'
  const alternateHref = mode === 'sign-in' ? '/register' : '/login'
  const alternateLabel = mode === 'sign-in' ? 'Need an account? Sign up' : 'Already have an account? Sign in'

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4 font-sans selection:bg-[#e4ff00] selection:text-black">
      {/* Dynamic Background Pattern - High Contrast Lines (No Gradients) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:64px_64px]" />
        {/* Subtle glowing lines in pure CSS */}
        <div className="absolute left-1/4 top-0 h-full w-[1px] bg-[#e4ff00]/10 shadow-[0_0_15px_#e4ff00]" />
        <div className="absolute left-3/4 top-0 h-full w-[1px] bg-[#e4ff00]/10 shadow-[0_0_15px_#e4ff00]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="relative overflow-hidden rounded-none border border-[#333] bg-black p-10 shadow-2xl transition-all duration-500 hover:border-[#e4ff00]/50">
          {/* Top Left Accent Bracket */}
          <div className="absolute -left-[1px] -top-[1px] h-4 w-4 border-l-2 border-t-2 border-[#e4ff00]" />
          {/* Bottom Right Accent Bracket */}
          <div className="absolute -bottom-[1px] -right-[1px] h-4 w-4 border-b-2 border-r-2 border-[#e4ff00]" />

          <div className="mb-10 text-center">
            <h1 className="font-mono text-5xl font-black uppercase tracking-tighter text-white">
              NUTR<span className="text-[#e4ff00]">IX</span>
            </h1>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-[1px] w-8 bg-[#333]" />
              <p className="text-xs uppercase tracking-widest text-[#888]">{title}</p>
              <div className="h-[1px] w-8 bg-[#333]" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-[#e4ff00]/20 bg-[#e4ff00]/5 p-4 text-center text-sm font-medium text-[#e4ff00]">
              Clerk authentication will launch securely in a new window overlay.
            </div>

            {mode === 'sign-in' ? (
              <SignInButton
                mode="modal"
                forceRedirectUrl="/dashboard"
                signUpForceRedirectUrl="/dashboard"
              >
                <Button className="group relative h-14 w-full overflow-hidden rounded-none bg-[#e4ff00] text-lg font-bold text-black transition-all hover:bg-[#e4ff00]/90">
                  <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-wide">
                    {cta}
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </Button>
              </SignInButton>
            ) : (
              <SignUpButton
                mode="modal"
                forceRedirectUrl="/dashboard"
                signInForceRedirectUrl="/dashboard"
              >
                <Button className="group relative h-14 w-full overflow-hidden rounded-none bg-[#e4ff00] text-lg font-bold text-black transition-all hover:bg-[#e4ff00]/90">
                  <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-wide">
                    {cta}
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </Button>
              </SignUpButton>
            )}

            <div className="pt-6 border-t border-[#222]">
              <Link
                href={alternateHref}
                className="group block text-center text-xs tracking-wider text-[#666] transition-colors hover:text-white"
              >
                <span className="border-b border-transparent pb-1 uppercase transition-colors group-hover:border-[#e4ff00]">
                  {alternateLabel}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
