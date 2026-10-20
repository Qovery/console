import { motion, useReducedMotion } from 'framer-motion'
import { type PropsWithChildren, useLayoutEffect, useRef, useState } from 'react'
import { OnboardingProgress } from '../onboarding-progress/onboarding-progress'

export function OnboardingCard({ step, children }: PropsWithChildren<{ step: 1 | 2 | 3 }>) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>()
  const reducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content) return
    const measure = () => {
      const nextHeight = content.getBoundingClientRect().height
      // Include the card's top and bottom border in its measured height.
      if (nextHeight > 0) setHeight(nextHeight + 2)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      initial={false}
      animate={{ height: height ?? 'auto' }}
      transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.165, 0.84, 0.44, 1] }}
      className="mb-10 w-full max-w-[480px] overflow-hidden rounded-2xl border border-neutral bg-background shadow-lg sm:mb-0"
    >
      <div ref={contentRef} className="flex flex-col gap-6 p-6">
        <OnboardingProgress step={step} />
        {children}
      </div>
    </motion.div>
  )
}
