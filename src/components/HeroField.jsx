import { useEffect, useRef } from 'react'

/** Subtle animated “field” of green dots — canvas, no external deps */
export function HeroField() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const dots = Array.from({ length: 120 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.4,
      s: 0.2 + Math.random() * 0.9,
    }))

    let t = 0
    const draw = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      t += 0.004
      dots.forEach((d, i) => {
        const gx = d.x * w
        const gy = d.y * h + Math.sin(t + i) * 6
        const alpha = 0.08 + (Math.sin(t * 2 + i) + 1) * 0.05
        ctx.fillStyle = `rgba(26, 71, 49, ${alpha})`
        ctx.beginPath()
        ctx.arc(gx, gy, d.r * d.s * 4, 0, Math.PI * 2)
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
