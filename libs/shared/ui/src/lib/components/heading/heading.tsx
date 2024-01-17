import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef, useContext } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { LevelContext } from './level-context'

type HX = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

const headingVariants = cva(['text-neutral-400'], {
  variants: {
    level: {
      0: [], // not really possible
      1: ['text-xl'],
      2: ['text-base'],
      3: ['text-sm'],
      4: ['text-xs'],
      5: ['text-xs'],
      6: ['text-xs'],
    },
    weight: {
      medium: ['font-medium'],
      bold: ['font-bold'],
    },
  },
  defaultVariants: {
    level: 1,
    weight: 'bold',
  },
})

export interface HeadingProps extends ComponentPropsWithoutRef<HX>, VariantProps<typeof headingVariants> {}

export const Heading = forwardRef<ElementRef<HX>, HeadingProps>(function Heading(
  { className, children, level: lvl, weight, ...props },
  forwardedRef
) {
  const ctxLvl = useContext(LevelContext) as 1 | 2 | 3 | 4 | 5 | 6
  const level = lvl ?? ctxLvl
  const _className = twMerge(headingVariants({ level, weight }), className)
  switch (level) {
    case 0:
      throw Error('Heading must be inside a Section!')
    case 1:
      return (
        <h1 ref={forwardedRef} className={_className} {...props}>
          {children}
        </h1>
      )
    case 2:
      return (
        <h2 ref={forwardedRef} className={_className} {...props}>
          {children}
        </h2>
      )
    case 3:
      return (
        <h3 ref={forwardedRef} className={_className} {...props}>
          {children}
        </h3>
      )
    case 4:
      return (
        <h4 ref={forwardedRef} className={_className} {...props}>
          {children}
        </h4>
      )
    case 5:
      return (
        <h5 ref={forwardedRef} className={_className} {...props}>
          {children}
        </h5>
      )
    case 6:
      return (
        <h6 ref={forwardedRef} className={_className} {...props}>
          {children}
        </h6>
      )
    default:
      throw Error('Unknown level: ' + level)
  }
})
