import { SignInButton, SignUpButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const Footer = () => {
  return (
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
  )
}

export default Footer
