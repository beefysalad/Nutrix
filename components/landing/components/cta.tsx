import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import FadeIn from './fade-in'

const Cta = () => {
  return (
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
  )
}

export default Cta
