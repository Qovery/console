import { motion } from 'framer-motion'
import { useState } from 'react'

const TESTIMONIALS = [
  <>
    <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/alan.svg"
        alt="Alan logo"
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">Alan</span> has reduced their deployment time by{' '}
      <span className="text-neutral">85%</span>
    </span>
  </>,
  <>
    <span className="flex h-3 w-3 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/kelvin.png"
        alt="Kelvin logo"
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">kelvin</span> slashed their deployment times by{' '}
      <span className="text-neutral">80%</span>
    </span>
  </>,
  <>
    <span className="flex h-3 w-3 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/charles_co.png"
        alt="Charles Co logo"
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">Charles.co</span> tripled their deployment speed with{' '}
      <span className="text-neutral">zero</span> downtime
    </span>
  </>,
  <>
    <span className="flex h-3 w-3 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/talkspace.svg"
        alt="Talkspace logo"
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">Talkspace</span> has reduced infrastructure time by{' '}
      <span className="text-neutral">50%</span>
    </span>
  </>,
  <>
    <span className="flex h-3 w-3 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/tint.png"
        alt="Tint logo"
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">Tint</span> has accelerated compliance by "weeks, if not months"
    </span>
  </>,
  <>
    <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      <img
        src="/assets/login/testimonials-logo/spiko.svg"
        alt="Spiko logo"
        aria-hidden
        className="h-full w-full object-contain"
      />
    </span>
    <span className="text-center">
      <span className="text-neutral">Spiko</span> has reduced their infrastructure setup time by{' '}
      <span className="text-neutral">70%</span>
    </span>
  </>,
]

function shuffleArray<T>(values: T[]) {
  const shuffled = [...values]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function TestimonialCarousel({
  className = 'flex items-center justify-center gap-2 px-4 py-4 text-sm text-neutral-subtle',
}: {
  className?: string
}) {
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [isTestimonialExiting, setIsTestimonialExiting] = useState(true)
  const [shuffledTestimonials] = useState(() => shuffleArray(TESTIMONIALS))

  const handleTestimonialAnimationComplete = () => {
    if (isTestimonialExiting) {
      setTestimonialIndex((previous) =>
        shuffledTestimonials.length > 0 ? (previous + 1) % shuffledTestimonials.length : 0
      )
      setIsTestimonialExiting(false)
      return
    }

    setIsTestimonialExiting(true)
  }

  return (
    <motion.div
      key={testimonialIndex}
      initial={isTestimonialExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      animate={
        isTestimonialExiting
          ? {
              opacity: 0,
              y: -8,
              transition: { delay: 5.2, duration: 0.4, ease: [0.55, 0.085, 0.68, 0.53] },
            }
          : {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: 'easeOut' },
            }
      }
      onAnimationComplete={handleTestimonialAnimationComplete}
      className={className}
    >
      {shuffledTestimonials[testimonialIndex]}
    </motion.div>
  )
}
