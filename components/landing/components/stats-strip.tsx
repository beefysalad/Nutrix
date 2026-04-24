import { useQuery } from '@tanstack/react-query'
import FadeIn from './fade-in'
import Counter from './counter'

type SiteStats = { mealCount: number; userCount: number; itemCount: number }

const StatsStrip = () => {
  const { data: stats } = useQuery<SiteStats>({
    queryKey: ['landing-stats'],
    queryFn: async () => {
      const r = await fetch('/api/stats')
      if (!r.ok) throw new Error('Network response was not ok')
      return r.json()
    },
  })

  const items = stats
    ? [
        { value: stats.mealCount, suffix: '', label: 'Meals logged' },
        { value: stats.itemCount, suffix: '', label: 'Food items tracked' },
        { value: stats.userCount, suffix: '', label: 'Users' },
        { value: 100, suffix: '%', label: 'Free to try' },
      ]
    : null

  return (
    <section className="mt-20 border-y border-white/[0.06] bg-[#0d0d0d] px-5 py-16 lg:px-10">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 lg:grid-cols-4">
        {items
          ? items.map((s) => (
              <FadeIn key={s.label} className="text-center">
                <Counter to={s.value} suffix={s.suffix} />
                <div className="mt-2 text-sm text-[#555]">{s.label}</div>
              </FadeIn>
            ))
          : ['Meals logged', 'Food items tracked', 'Users', 'Free to try'].map(
              (label) => (
                <div key={label} className="text-center">
                  <div className="font-mono text-5xl font-black text-[#e4ff00]/30">
                    —
                  </div>
                  <div className="mt-2 text-sm text-[#555]">{label}</div>
                </div>
              )
            )}
      </div>
    </section>
  )
}

export default StatsStrip
