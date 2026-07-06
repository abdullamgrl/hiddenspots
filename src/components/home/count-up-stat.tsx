'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpStatProps {
  value: number
  suffix?: string
  label: string
}

/**
 * Stat that counts up from 0 when scrolled into view. Respects
 * prefers-reduced-motion (jumps straight to the final value).
 */
export function CountUpStat({ value, suffix = '', label }: CountUpStatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        observer.disconnect()

        if (reduceMotion || value === 0) {
          setDisplay(value)
          return
        }

        const duration = 1200
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          // ease-out cubic
          setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref}>
      <div className="font-script text-4xl sm:text-5xl font-extrabold text-sunset tabular-nums">
        {display}
        {suffix}
      </div>
      <div className="text-xs text-muted-foreground uppercase font-semibold mt-2">{label}</div>
    </div>
  )
}
