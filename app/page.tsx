import { auth } from '@clerk/nextjs/server'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'


export default async function Home() {
  const { userId } = await auth()

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(228,255,0,0.12),transparent_30%),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-2xl font-black uppercase tracking-tighter text-[#f5f5f5]"
          >
            NUTR<span className="text-[#e4ff00]">IX</span>
          </Link>

          <div className="flex items-center gap-3">
            {userId ? (
              <Link
                href="/dashboard"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:border-[#e4ff00]/40"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:border-[#e4ff00]/40"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-[#e4ff00] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#f0ff4d]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </header>

        <section className="flex flex-1 items-center py-16">
          <div className="grid w-full gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/8 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-[#f3ff8a]">
                Nutrition tracking, simplified
              </div>

              <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                A cleaner way to log meals, goals, and progress.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#9a9a9a]">
                Nutrix gives you a focused nutrition dashboard without the usual clutter.
                Log meals, review history, and stay on top of your targets from one place.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={userId ? '/dashboard' : '/register'}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#e4ff00] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#f0ff4d]"
                >
                  {userId ? 'Open dashboard' : 'Start free'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={userId ? '/dashboard/history' : '/login'}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white transition-colors hover:border-[#e4ff00]/40"
                >
                  {userId ? 'View history' : 'Sign in'}
                </Link>
              </div>
            </div>

            
          </div>
        </section>
      </div>
    </main>
  )
}
