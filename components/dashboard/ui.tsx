export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function SectionCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-[#141414] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
