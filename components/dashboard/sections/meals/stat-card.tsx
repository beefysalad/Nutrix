export function StatCard({
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
          ? 'rounded-2xl border border-[#e4ff00]/25 bg-[#e4ff00]/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(228,255,0,0.14)]'
          : 'rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
      }
    >
      <div className="text-[9px] font-black tracking-[0.24em] text-[#5f5f5f] uppercase">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-xl font-black sm:text-2xl ${accent ? 'text-[#e4ff00]' : 'text-[#f0f0f0]'}`}
      >
        {value}
      </div>
    </div>
  )
}
