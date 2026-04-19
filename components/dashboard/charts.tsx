export function MiniBarChart({
  data,
  color = '#4ade80',
}: {
  data: Array<{ label: string; value: number }>
  color?: string
}) {
  const max = Math.max(...data.map((item) => item.value))

  return (
    <div className="space-y-4">
      <div className="flex h-64 items-end gap-4 rounded-2xl border border-white/5 bg-[#0a0a0a] p-5">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
            <div className="relative flex h-full w-full items-end justify-center">
              <div className="absolute inset-x-2 bottom-0 top-0 rounded-full bg-white/[0.03]" />
              <div
                className="relative w-full rounded-t-xl"
                style={{
                  height: `${(item.value / max) * 100}%`,
                  background: `linear-gradient(180deg, ${color} 0%, rgba(74,222,128,0.35) 100%)`,
                }}
              />
            </div>
            <div className="text-center">
              <div className="font-mono text-sm text-[#4ade80]">{item.value}</div>
              <div className="text-xs text-[#888]">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MiniDonut({
  data,
  totalLabel,
}: {
  data: Array<{ name: string; value: number; color: string }>
  totalLabel: string
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const segments = data.reduce<Array<(typeof data)[number] & { length: number; offset: number }>>(
    (all, item) => {
      const fraction = item.value / total
      const length = fraction * 339.292
      const offset =
        all.length === 0 ? 0 : all[all.length - 1].offset + all[all.length - 1].length

      all.push({ ...item, length, offset })
      return all
    },
    [],
  )

  return (
    <div className="space-y-5">
      <div className="relative mx-auto h-52 w-52">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#242424" strokeWidth="12" />
          {segments.map((segment) => (
            <circle
              key={segment.name}
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={segment.color}
              strokeWidth="12"
              strokeDasharray={`${segment.length} 339.292`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-mono text-4xl text-[#4ade80]">{totalLabel}</div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#666]">today</div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[#888]">{item.name}</span>
            </div>
            <span className="font-mono text-[#f5f5f5]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MiniLineChart({
  data,
}: {
  data: Array<{ label: string; calories: number; goal: number }>
}) {
  const width = 520
  const height = 240
  const max = Math.max(...data.map((item) => Math.max(item.calories, item.goal))) + 100
  const stepX = width / (data.length - 1)
  const toY = (value: number) => height - (value / max) * (height - 24) - 12

  const caloriesPath = data
    .map((item, index) => `${index === 0 ? 'M' : 'L'} ${index * stepX} ${toY(item.calories)}`)
    .join(' ')

  const goalPath = data
    .map((item, index) => `${index === 0 ? 'M' : 'L'} ${index * stepX} ${toY(item.goal)}`)
    .join(' ')

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={height * ratio}
              x2={width}
              y2={height * ratio}
              stroke="#242424"
              strokeDasharray="4 8"
            />
          ))}
          <path d={goalPath} fill="none" stroke="#767676" strokeDasharray="6 8" strokeWidth="3" />
          <path d={caloriesPath} fill="none" stroke="#4ade80" strokeWidth="4" />
          {data.map((item, index) => (
            <circle
              key={item.label}
              cx={index * stepX}
              cy={toY(item.calories)}
              r="5"
              fill="#4ade80"
            />
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-[#777]">
        {data.map((item) => (
          <div key={item.label}>{item.label}</div>
        ))}
      </div>
    </div>
  )
}

export function StackedBars({
  data,
}: {
  data: Array<{ label: string; protein: number; carbs: number; fat: number }>
}) {
  const max = Math.max(...data.map((item) => item.protein + item.carbs + item.fat))

  return (
    <div className="space-y-4">
      <div className="flex h-72 items-end gap-4 rounded-2xl border border-white/5 bg-[#0a0a0a] p-5">
        {data.map((item) => {
          const total = item.protein + item.carbs + item.fat
          const totalHeight = (total / max) * 100

          return (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
              <div className="flex h-full w-full items-end justify-center">
                <div className="flex w-full flex-col overflow-hidden rounded-t-xl">
                  <div
                    style={{ height: `${(item.protein / total) * totalHeight}%` }}
                    className="w-full bg-[#4ade80]"
                  />
                  <div
                    style={{ height: `${(item.carbs / total) * totalHeight}%` }}
                    className="w-full bg-[#22c55e]"
                  />
                  <div
                    style={{ height: `${(item.fat / total) * totalHeight}%` }}
                    className="w-full bg-[#888888]"
                  />
                </div>
              </div>
              <div className="text-xs text-[#777]">{item.label}</div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4 text-xs text-[#888]">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#4ade80]" />
          Protein
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
          Carbs
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#888888]" />
          Fat
        </span>
      </div>
    </div>
  )
}
