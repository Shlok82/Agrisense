import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

export function StatCounter({ label, target, format }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 1300
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - p) ** 3
      setDisplay(target * eased)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])

  const text = format ? format(display) : String(Math.round(display))

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-black/5 bg-white/70 p-5 text-center shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#1a4731]/40"
    >
      <p className="text-3xl font-black tracking-tight text-[#1a4731] dark:text-[#fafaf7] sm:text-4xl">{text}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/70">{label}</p>
    </motion.div>
  )
}
