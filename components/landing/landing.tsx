'use client'

import { useEffect, useState } from 'react'

import { SignInButton, SignUpButton } from '@clerk/nextjs'
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  Flame,
  MessageCircle,
  Target,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import Counter from './counter'
import FadeIn from './fade-in'

import { Button } from '@/components/ui/button'

type SiteStats = { mealCount: number; userCount: number; itemCount: number }

function StatsStrip() {
  const [stats, setStats] = useState<SiteStats | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d: SiteStats) => setStats(d))
      .catch(() => {})
  }, [])

  const items = stats
    ? [
        { value: stats.mealCount, suffix: '', label: 'Meals logged' },
        { value: stats.itemCount, suffix: '', label: 'Food items tracked' },
        { value: stats.userCount, suffix: '', label: 'Users' },
        { value: 100, suffix: '%', label: 'Free to try' },
      ]
    : null

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 lg:grid-cols-4">
      {items
        ? items.map((s) => (
            <FadeIn key={s.label} className="text-center">
              <Counter to={s.value} suffix={s.suffix} />
              <div className="mt-2 text-sm text-[#555]">{s.label}</div>
            </FadeIn>
          ))
        : ['Meals logged', 'Food items tracked', 'Users', 'Free to try'].map(
            (label) => (
              <div key={label} className="text-center">
                <div className="font-mono text-5xl font-black text-[#e4ff00]/30">
                  —
                </div>
                <div className="mt-2 text-sm text-[#555]">{label}</div>
              </div>
            )
          )}
    </div>
  )
}

const LandingPageComponent = () => {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080808] text-white">
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/[0.06] bg-[#080808]/80 px-5 py-4 backdrop-blur-xl lg:px-10">
        <Link
          href="/"
          className="font-mono text-xl font-black tracking-tighter text-[#f5f5f5] uppercase"
        >
          NUTR<span className="text-[#e4ff00]">IX</span>
        </Link>
        <nav className="flex items-center gap-2">
          <SignInButton mode="modal">
            <Button className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 transition-all duration-200 hover:border-white/20 hover:text-white">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="inline-flex items-center gap-1.5 rounded-full bg-[#e4ff00] px-4 py-2 text-sm font-bold text-black transition-all duration-200 hover:bg-[#f0ff4d] hover:shadow-[0_0_20px_rgba(228,255,0,0.35)]">
              Sign up
            </Button>
          </SignUpButton>
        </nav>
      </header>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pt-20 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:68px_68px]" />
          <div className="absolute top-1/3 left-1/2 h-[600px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(228,255,0,0.14),transparent_65%)] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[300px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(228,255,0,0.06),transparent_60%)] blur-3xl" />
          <div className="absolute right-0 bottom-0 h-[300px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(228,255,0,0.05),transparent_60%)] blur-3xl" />
        </div>

        <div className="relative max-w-4xl">
          <h1 className="mt-5 text-5xl leading-[1.12] font-semibold tracking-tight text-balance text-white sm:text-6xl lg:text-7xl">
            Nutrition tracking
            <br />
            <span className="relative">
              <span className="relative z-10 text-[#e4ff00]">
                without the noise.
              </span>
              <span className="absolute -inset-x-2 bottom-1 -z-0 h-[10px] bg-[#e4ff00]/12 blur-sm" />
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#888]">
            Nutrix brings meal logging, macro goals, Telegram capture, and daily
            review into one sharp, distraction-free flow. No bloat. Just the
            numbers that keep you consistent.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <SignUpButton mode="modal">
              <Button className="inline-flex items-center gap-2 rounded-2xl bg-[#e4ff00] px-8 py-3.5 text-sm font-bold text-black shadow-[0_0_30px_rgba(228,255,0,0.25)] transition-all duration-200 hover:bg-[#f0ff4d] hover:shadow-[0_0_40px_rgba(228,255,0,0.45)]">
                Sign up
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-3.5 text-sm font-medium text-white/80 transition-all duration-200 hover:border-white/20 hover:text-white">
                Sign in
              </Button>
            </SignInButton>
          </div>

          {/* trust row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-[#555]">
            {[
              'No credit card required',
              'Works with Telegram',
              'AI-powered parsing',
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#e4ff00]/60" />
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-16 w-full max-w-3xl">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_top,rgba(228,255,0,0.18),transparent_55%)] blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))] p-1 shadow-[0_40px_140px_rgba(0,0,0,0.6)]">
            <div className="rounded-[1.75rem] border border-white/[0.06] bg-[#0d0d0d] p-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <div className="text-[10px] font-black tracking-[0.22em] text-[#444] uppercase">
                    Today&apos;s overview
                  </div>
                  <div className="mt-1 text-lg font-semibold text-[#f0f0f0]">
                    Wednesday, Apr 23
                  </div>
                </div>
                <div className="rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/10 px-3 py-1 text-[10px] font-black tracking-widest text-[#e4ff00] uppercase">
                  Nutrix
                </div>
              </div>

              {/* macro stats */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Calories', val: '1,860', accent: true },
                  { label: 'Protein', val: '132g', accent: false },
                  { label: 'Remaining', val: '340', accent: false },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={
                      s.accent
                        ? 'rounded-2xl border border-[#e4ff00]/15 bg-[#e4ff00]/8 p-4'
                        : 'rounded-2xl border border-white/[0.08] bg-[#141414] p-4'
                    }
                  >
                    <div className="text-[10px] font-black tracking-widest text-[#555] uppercase">
                      {s.label}
                    </div>
                    <div
                      className={`mt-2 font-mono text-2xl font-black ${s.accent ? 'text-[#e4ff00]' : 'text-[#f0f0f0]'}`}
                    >
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 overflow-hidden rounded-full border border-white/5 bg-white/[0.03] p-1">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,#e4ff00,#aacc00)]"
                  style={{
                    width: '84%',
                    boxShadow: '0 0 12px rgba(228,255,0,0.5)',
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-[#444]">
                <span>84% of daily goal</span>
                <span>340 kcal left</span>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  {
                    kicker: 'Breakfast · 7:32 AM',
                    name: 'Sinangag + 2 Eggs',
                    cal: '420 kcal',
                  },
                  {
                    kicker: 'Lunch · 12:05 PM',
                    name: 'Chicken rice + iced coffee',
                    cal: '680 kcal',
                  },
                  {
                    kicker: 'Snack · 3:18 PM',
                    name: 'Banana + peanut butter',
                    cal: '260 kcal',
                  },
                  {
                    kicker: 'Dinner · 7:00 PM',
                    name: 'Sinigang na baboy + rice',
                    cal: '500 kcal',
                  },
                ].map((m) => (
                  <div
                    key={m.name}
                    className="rounded-xl border border-white/[0.06] bg-[#111] px-4 py-3"
                  >
                    <div className="text-[10px] font-black tracking-widest text-[#444] uppercase">
                      {m.kicker}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-[#ddd]">
                      {m.name}
                    </div>
                    <div className="mt-0.5 text-xs text-[#e4ff00]/70">
                      {m.cal}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e4ff00]/10">
                  <Bot className="h-4 w-4 text-[#e4ff00]" />
                </div>
                <span className="text-sm text-[#777]">
                  Telegram:{' '}
                  <span className="text-[#aaa]">
                    {' '}
                    &quot;4 siomai and rice&quot;
                  </span>{' '}
                  → parsed in 1.2s
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-20 border-y border-white/[0.06] bg-[#0d0d0d] px-5 py-16 lg:px-10">
        <StatsStrip />
      </section>

      <section className="px-5 py-24 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <FadeIn className="text-center">
            <div className="mb-3 text-xs font-black tracking-[0.26em] text-[#e4ff00]/60 uppercase">
              How it works
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
              From meal to insight in seconds
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#666]">
              Three steps. No friction. Your nutrition data, always ready.
            </p>
          </FadeIn>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {[
              {
                step: '01',
                icon: <MessageCircle className="h-6 w-6" />,
                title: 'Log via Telegram or dashboard',
                body: 'Send a free-text message to @NutrrixBot or use the web dashboard. Our AI parses any meal description into structured calories and macros.',
              },
              {
                step: '02',
                icon: <Zap className="h-6 w-6" />,
                title: 'AI does the math instantly',
                body: 'Gemini-powered parsing normalises food names, handles local Filipino dishes, and flags assumptions so you stay in control.',
              },
              {
                step: '03',
                icon: <CalendarDays className="h-6 w-6" />,
                title: 'Review trends and stay consistent',
                body: 'Calendar view, weekly summaries, and daily star ratings keep you accountable without overwhelming you with charts.',
              },
            ].map((s, i) => (
              <FadeIn
                key={s.step}
                delay={i * 100}
                className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0d0d0d] p-7 transition-all duration-300 hover:border-[#e4ff00]/20 hover:shadow-[0_0_40px_rgba(228,255,0,0.06)]"
              >
                <div className="absolute -top-4 -right-4 font-mono text-8xl leading-none font-black text-white/[0.03]">
                  {s.step}
                </div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e4ff00]/15 bg-[#e4ff00]/8 text-[#e4ff00] transition-all duration-300 group-hover:border-[#e4ff00]/30 group-hover:bg-[#e4ff00]/12">
                  {s.icon}
                </div>
                <div className="text-[10px] font-black tracking-[0.22em] text-[#e4ff00]/50 uppercase">
                  Step {s.step}
                </div>
                <h3 className="mt-2 text-base font-semibold text-[#f0f0f0]">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#666]">
                  {s.body}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0a0a0a] px-5 py-24 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <FadeIn className="text-center">
            <div className="mb-3 text-xs font-black tracking-[0.26em] text-[#e4ff00]/60 uppercase">
              Features
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </FadeIn>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Bot className="h-5 w-5" />,
                title: 'Telegram meal capture',
                body: 'Log from anywhere with a free-text message. No app switching required.',
              },
              {
                icon: <Target className="h-5 w-5" />,
                title: 'Goal-first design',
                body: 'Set cutting, maintenance, or bulking targets. Your remaining macros are always front and center.',
              },
              {
                icon: <Flame className="h-5 w-5" />,
                title: 'AI food parsing',
                body: 'Handles Filipino dishes, branded foods, and ambiguous descriptions with confidence scores.',
              },
              {
                icon: <CalendarDays className="h-5 w-5" />,
                title: 'Calendar history',
                body: 'See your nutrition heat-map across weeks and months. Spot patterns at a glance.',
              },
              {
                icon: <Zap className="h-5 w-5" />,
                title: 'Smart suggestions',
                body: 'AI-generated meal ideas with real recipe sources, tailored to your remaining macros.',
              },
              {
                icon: <CheckCircle2 className="h-5 w-5" />,
                title: 'Daily review',
                body: 'End each day with a quick star rating and a note. Consistency is built in small moments.',
              },
            ].map((f, i) => (
              <FadeIn
                key={f.title}
                delay={i * 60}
                className="group rounded-2xl border border-white/[0.07] bg-[#0d0d0d] p-6 transition-all duration-300 hover:border-[#e4ff00]/15 hover:shadow-[0_0_30px_rgba(228,255,0,0.05)]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#e4ff00]/15 bg-[#e4ff00]/8 text-[#e4ff00] transition-colors duration-300 group-hover:border-[#e4ff00]/30">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-[#f0f0f0]">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5a5a5a]">
                  {f.body}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0d0d0d]">
            <div className="grid lg:grid-cols-2">
              <FadeIn className="flex flex-col justify-center p-10 lg:p-14">
                <div className="mb-3 text-xs font-black tracking-[0.26em] text-[#e4ff00]/60 uppercase">
                  Telegram integration
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-balance text-white">
                  Your nutrition tracker lives in Telegram
                </h2>
                <p className="mt-4 leading-relaxed text-[#666]">
                  No need to open the web app. Just message{' '}
                  <span className="font-semibold text-[#f0f0f0]">
                    @NutrrixBot
                  </span>{' '}
                  what you ate and get an instant breakdown. Check today&apos;s
                  totals, ask for a weekly recap, or get meal suggestions — all
                  in chat.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    'Log meals in plain language',
                    'Get instant calorie & macro breakdown',
                    'Ask for a daily or weekly summary',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-[#777]"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#e4ff00]/70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </FadeIn>

              <div className="flex items-center justify-center border-t border-white/[0.06] bg-[#0a0a0a] p-10 lg:border-t-0 lg:border-l">
                <div className="w-full max-w-xs space-y-3">
                  {[
                    { side: 'user', msg: '4 siomai and rice' },
                    {
                      side: 'bot',
                      msg: '🍱 Logged!\n\nSiomai (4 pcs): ~200 kcal\nSteamed rice (1 cup): ~240 kcal\n\nTotal: 440 kcal · P 18g · C 62g · F 12g',
                    },
                    { side: 'user', msg: '/summary' },
                    {
                      side: 'bot',
                      msg: '📊 Today so far:\n1,520 kcal consumed\n340 kcal remaining\nProtein: 112g / 150g goal',
                    },
                  ].map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.side === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                          m.side === 'user'
                            ? 'rounded-br-sm bg-[#e4ff00] text-black'
                            : 'rounded-bl-sm border border-white/[0.08] bg-[#161616] text-[#ccc]'
                        }`}
                      >
                        {m.msg}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <FadeIn>
            <div className="relative inline-block w-full overflow-hidden rounded-3xl border border-[#e4ff00]/15 bg-[linear-gradient(135deg,rgba(228,255,0,0.06),rgba(228,255,0,0.01))] px-8 py-16 shadow-[0_0_80px_rgba(228,255,0,0.07)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(228,255,0,0.1),transparent_65%)]" />
              <div className="relative">
                <div className="mb-3 text-xs font-black tracking-[0.26em] text-[#e4ff00]/60 uppercase">
                  Get started today
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
                  Ready to own your nutrition?
                </h2>
                <p className="mx-auto mt-4 max-w-md text-[#666]">
                  Free to try. No credit card. Start logging in under 60
                  seconds.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <SignUpButton mode="modal">
                    <Button className="inline-flex items-center gap-2 rounded-2xl bg-[#e4ff00] px-8 py-3.5 text-sm font-bold text-black shadow-[0_0_30px_rgba(228,255,0,0.3)] transition-all duration-200 hover:bg-[#f0ff4d] hover:shadow-[0_0_50px_rgba(228,255,0,0.5)]">
                      Start free
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-3.5 text-sm font-medium text-white/70 transition-all duration-200 hover:border-white/20 hover:text-white">
                      Already have an account
                    </Button>
                  </SignInButton>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] px-5 py-8 lg:px-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="font-mono text-lg font-black tracking-tighter text-[#f5f5f5] uppercase"
          >
            NUTR<span className="text-[#e4ff00]">IX</span>
          </Link>
          <p className="text-sm text-[#444]">
            Built by John Patrick Ryan Mandal
          </p>
          <div className="flex gap-5 text-sm text-[#444]">
            <SignInButton mode="modal">
              <Button className="transition-colors hover:text-white">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="transition-colors hover:text-white">
                Register
              </Button>
            </SignUpButton>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default LandingPageComponent
