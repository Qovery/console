import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef, useContext } from 'react'
import { twMerge } from 'tailwind-merge'
import { LevelContext } from '../heading/level-context'

const sectionVariants = cva(['flex', 'flex-col'], {
  variants: {
    variant: {
      neutral: ['text-neutral-350'],
    },
    level: {
      // TODO: work on design system to standardize font-size
      1: 'text-sm',
      2: 'text-sm',
      3: 'text-sm',
      4: 'text-sm',
      5: 'text-sm',
      6: 'text-sm',
    },
  },
  defaultVariants: {
    variant: 'neutral',
    level: 1,
  },
})

export interface SectionProps extends ComponentPropsWithoutRef<'section'>, VariantProps<typeof sectionVariants> {}

export const Section = forwardRef<ElementRef<'section'>, SectionProps>(function Section(
  { className, children, variant, level: lvl, ...props },
  forwardedRef
) {
  const ctxLvl = useContext(LevelContext) as 1 | 2 | 3 | 4 | 5 | 6
  const level = lvl ?? ctxLvl
  return (
    <section ref={forwardedRef} className={twMerge(sectionVariants({ variant, level }), className)} {...props}>
      <LevelContext.Provider value={level + 1}>{children}</LevelContext.Provider>
    </section>
  )
})

export default Section
