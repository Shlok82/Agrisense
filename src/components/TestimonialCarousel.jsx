import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const stories = [
  {
    name: 'Sunita Kadam',
    village: 'Osmanabad district',
    crop: 'Soybean',
    quote:
      'The irrigation reminder matched our drip schedule and saved one redundant watering during the monsoon break.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita',
  },
  {
    name: 'Vikram Jadhav',
    village: 'Jalna district',
    crop: 'Cotton',
    quote:
      'Leaf photo screening caught early alternaria pressure; we treated only the affected rows and avoided a blanket spray.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
  },
  {
    name: 'Priya Shinde',
    village: 'Satara district',
    crop: 'Tomato',
    quote:
      'Cost calculator showed labour was dominating spend — we shifted some tying work to family labour and trimmed hired hours.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  },
]

export function TestimonialCarousel({ title }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % stories.length), 5200)
    return () => clearInterval(id)
  }, [])

  const active = stories[idx]

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="flex gap-1" aria-label="Carousel position">
          {stories.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show testimonial ${i + 1}`}
              className={`h-2 w-6 rounded-full transition ${i === idx ? 'bg-[#f59e0b]' : 'bg-black/10 dark:bg-white/20'}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#1a4731]/35">
        <Quote className="mb-3 h-6 w-6 text-[#f59e0b]" aria-hidden="true" />
        <AnimatePresence mode="wait">
          <motion.div
            key={active.name}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <p className="text-sm leading-relaxed text-black/80 dark:text-white/80">{active.quote}</p>
            <div className="flex items-center gap-3">
              <img
                src={active.avatar}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-full border border-black/10 bg-white dark:border-white/20"
              />
              <div>
                <p className="text-sm font-semibold">{active.name}</p>
                <p className="text-xs text-black/60 dark:text-white/60">
                  {active.village} · {active.crop}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
