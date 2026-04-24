import React from 'react'
import FadeIn from './fade-in'
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  Flame,
  Target,
  Zap,
} from 'lucide-react'

const Features = () => {
  const features = [
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
  ]
  return (
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
          {features.map((f, i) => (
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
  )
}

export default Features
