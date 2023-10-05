import { type ComponentPropsWithoutRef, type ElementRef, forwardRef, useContext } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { LevelContext } from '../heading/level-context'

export interface SectionProps extends ComponentPropsWithoutRef<'section'> {}

export const Section = forwardRef<ElementRef<'section'>, SectionProps>(function Section(
  { className, children, ...props },
  forwardedRef
) {
  const level = useContext(LevelContext)
  return (
    <section ref={forwardedRef} className={twMerge('flex flex-col', className)} {...props}>
      <LevelContext.Provider value={level + 1}>{children}</LevelContext.Provider>
    </section>
  )
})

export default Section
