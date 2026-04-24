import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Bot, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Hero = () => {
  return (
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
  )
}

export default Hero
