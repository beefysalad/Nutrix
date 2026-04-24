import { Bot, PencilLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SheetLogMode } from './types'

export function LogModeChoice({ onSelect }: { onSelect: (mode: Exclude<SheetLogMode, null>) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onSelect('ai')}
        className="h-auto justify-start rounded-3xl p-5 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e4ff00] text-[#0a0a0a]">
          <Bot className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-semibold text-[#f5f5f5]">Log with AI</span>
          <span className="mt-1 block whitespace-normal text-sm leading-6 text-[#888]">
            Type a normal sentence and review the estimate.
          </span>
        </span>
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => onSelect('manual')}
        className="h-auto justify-start rounded-3xl p-5 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0a] text-[#d0d0d0]">
          <PencilLine className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-semibold text-[#f5f5f5]">Log manually</span>
          <span className="mt-1 block whitespace-normal text-sm leading-6 text-[#888]">
            Enter calories and macros yourself.
          </span>
        </span>
      </Button>
    </div>
  )
}
