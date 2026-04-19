import { auth } from '@clerk/nextjs/server'
import { ArrowRight, Bot, CalendarDays, Sparkles, Target } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

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
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/8 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-[#f3ff8a]">
                  Nutrition tracking, simplified
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#e4ff00]">
                  Beta
                </div>
              </div>

              <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                A sharper nutrition dashboard for people who want clarity, not clutter.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#9a9a9a]">
                Nutrix keeps meal logging, goals, Telegram capture, and daily review in one focused flow.
                No noisy charts, no bloated setup, just the numbers and habits that help you stay consistent.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <FeaturePill
                  icon={<Bot className="h-4 w-4" />}
                  title="Telegram flow"
                  description="Log meals and check quick summaries in chat"
                />
                <FeaturePill
                  icon={<Target className="h-4 w-4" />}
                  title="Goal-first"
                  description="Calories and macros that stay visible"
                />
                <FeaturePill
                  icon={<CalendarDays className="h-4 w-4" />}
                  title="History views"
                  description="Calendar, reports, and weekly review"
                />
              </div>

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

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-[#7d7d7d]">
                <div>
                  <div className="font-mono text-2xl font-black text-[#f5f5f5]">Fast</div>
                  <div className="mt-1">Built for quick meal capture</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-black text-[#f5f5f5]">Focused</div>
                  <div className="mt-1">Only the signals that matter</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-black text-[#f5f5f5]">Flexible</div>
                  <div className="mt-1">Dashboard and bot working together</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(228,255,0,0.16),transparent_45%)] blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
                <div className="rounded-[1.5rem] border border-white/10 bg-[#0d0d0d] p-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.22em] text-[#666]">
                        Today at a glance
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-[#f5f5f5]">
                        Calm control over your intake
                      </div>
                    </div>
                    <div className="rounded-full border border-[#e4ff00]/20 bg-[#e4ff00]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#e4ff00]">
                      Nutrix
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <PreviewStat label="Calories" value="1,860" accent />
                    <PreviewStat label="Protein" value="132g" />
                    <PreviewStat label="Remaining" value="340" />
                  </div>

                  <div className="mt-4 grid gap-3">
                    <PreviewCard
                      kicker="Telegram"
                      title="Meal captured in seconds"
                      description="Chicken rice + iced coffee parsed into calories and macros."
                    />
                    <PreviewCard
                      kicker="Telegram Summary"
                      title="History follows you into chat"
                      description="Ask for a quick recap and review recent intake without opening the dashboard."
                    />
                    <PreviewCard
                      kicker="Daily Review"
                      title="Reflection stays lightweight"
                      description="Log a quick star rating and note so consistency is easier to maintain."
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[#b5b5b5]">
                    <Sparkles className="h-4 w-4 text-[#e4ff00]" />
                    Designed to feel lightweight every day, not impressive only on day one.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function FeaturePill({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-[#e4ff00]">
        {icon}
        <span className="text-sm font-semibold text-[#f5f5f5]">{title}</span>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-[#7f7f7f]">{description}</div>
    </div>
  )
}

function PreviewStat({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div
      className={
        accent
          ? 'rounded-2xl border border-[#e4ff00]/10 bg-[#e4ff00]/8 p-4'
          : 'rounded-2xl border border-white/10 bg-[#151515] p-4'
      }
    >
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#666]">{label}</div>
      <div className={accent ? 'mt-2 font-mono text-3xl font-black text-[#e4ff00]' : 'mt-2 font-mono text-3xl font-black text-[#f5f5f5]'}>
        {value}
      </div>
    </div>
  )
}

function PreviewCard({
  kicker,
  title,
  description,
}: {
  kicker: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#131313] p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#666]">{kicker}</div>
      <div className="mt-2 text-base font-semibold text-[#f5f5f5]">{title}</div>
      <div className="mt-1 text-sm leading-relaxed text-[#7f7f7f]">{description}</div>
    </div>
  )
}
