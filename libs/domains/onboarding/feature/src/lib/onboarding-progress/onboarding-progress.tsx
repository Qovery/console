import { motion, useReducedMotion } from 'framer-motion'

export function OnboardingProgress({ step }: { step: 1 | 2 }) {
  const reducedMotion = useReducedMotion()
  return (
    <div
      role="progressbar"
      aria-label="Onboarding progress"
      aria-valuemin={1}
      aria-valuemax={2}
      aria-valuenow={step}
      aria-valuetext={`Step ${step} of 2`}
      className="flex gap-2"
    >
      {[1, 2].map((value) => (
        <span key={value} className="relative h-1 flex-1 overflow-hidden rounded-2xl bg-surface-brand-component">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl border-[0.5px] border-brand-subtle"
          />
          <motion.span
            initial={false}
            animate={{
              transform: reducedMotion || value <= step ? 'scaleX(1)' : 'scaleX(0)',
              opacity: value <= step ? 1 : 0,
            }}
            transition={{ duration: reducedMotion ? 0.12 : 0.28, ease: [0.165, 0.84, 0.44, 1] }}
            className="relative block h-full origin-left rounded-2xl bg-surface-brand-solid"
          />
        </span>
      ))}
    </div>
  )
}
