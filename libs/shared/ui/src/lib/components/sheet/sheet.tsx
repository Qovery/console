import { type HTMLMotionProps, motion, useReducedMotion } from 'framer-motion'
import { type ForwardedRef, forwardRef, useEffect } from 'react'
import { twMerge } from '@qovery/shared/util-js'

export interface SheetProps extends HTMLMotionProps<'div'> {
  onClose?: () => void
  onEntered?: () => void
}

export const Sheet = forwardRef<HTMLDivElement, SheetProps>(function Sheet(
  { children, className, onAnimationComplete, onClose, onEntered, style, ...props },
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (!onClose) return

    const down = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onClose])

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : {
        x: {
          type: 'spring' as const,
          stiffness: 900,
          // Critically damped (2 * sqrt(stiffness * mass) = ~42.4) to avoid visible overshoot/jitter.
          damping: 45,
          mass: 0.5,
        },
        opacity: {
          duration: 0.12,
        },
      }

  return (
    <motion.div
      ref={forwardedRef}
      initial={shouldReduceMotion ? false : { x: 32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { x: 32, opacity: 0 }}
      transition={transition}
      onAnimationComplete={(definition) => {
        onAnimationComplete?.(definition)

        if (typeof definition === 'object' && !Array.isArray(definition) && definition.opacity === 1) {
          onEntered?.()
        }
      }}
      // backfaceVisibility hint forces a dedicated compositor layer so sheets
      // do not trigger repaints on sticky content behind them.
      style={{ ...style, backfaceVisibility: 'hidden' }}
      className={twMerge(
        'flex h-full flex-col overflow-hidden border-l border-neutral bg-background shadow-sm will-change-transform',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
})

export default Sheet
