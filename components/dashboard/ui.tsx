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

export function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-[#0a0a0a] px-6 py-10 text-center">
      <h3 className="text-lg text-[#f5f5f5]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#777]">{description}</p>
    </div>
  )
}
