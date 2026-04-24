import { CheckCircle2 } from 'lucide-react'
import FadeIn from './fade-in'

const TelegramIntegration = () => {
  return (
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
  )
}

export default TelegramIntegration
