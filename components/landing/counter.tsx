'use client'

import { useEffect, useRef, useState } from 'react'

const Counter = ({ to, suffix = '' }: { to: number; suffix?: string }) => {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()
        let start = 0
        const step = Math.ceil(to / 60)
        const id = setInterval(() => {
          start = Math.min(start + step, to)
          setVal(start)
          if (start >= to) clearInterval(id)
        }, 16)
      },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [to])

  return (
    <div ref={ref} className="font-mono text-5xl font-black text-[#e4ff00]">
      {val.toLocaleString()}
      {suffix}
    </div>
  )
}

export default Counter
