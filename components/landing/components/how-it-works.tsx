import { CalendarDays, MessageCircle, Zap } from 'lucide-react'
import FadeIn from './fade-in'

const HowItWorks = () => {
  const steps = [
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
  ]

  return (
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
          {steps.map((s, i) => (
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
  )
}

export default HowItWorks
