import { SignInButton, SignUpButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const Header = () => {
  return (
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
  )
}

export default Header
