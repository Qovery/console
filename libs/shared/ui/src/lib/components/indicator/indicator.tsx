import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, type ReactNode, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const indicatorVariants = cva('absolute', {
  variants: {
    side: {
      top: ['top-0'],
      right: ['right-0'],
      bottom: ['bottom-0'],
      left: ['left-0'],
    },
    align: {
      center: ['left-1/2', 'translate-x-1/2'],
      start: ['left-0'],
      end: ['right-0'],
    },
  },
  compoundVariants: [
    { side: 'top', align: 'center', className: 'left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { side: 'top', align: 'start', className: 'left-0 -translate-x-1/2 -translate-y-1/2' },
    { side: 'top', align: 'end', className: 'right-0 -translate-y-1/2 translate-x-1/2' },

    { side: 'right', align: 'center', className: 'left-auto top-2/4 -translate-y-1/2 translate-x-1/2' },
    { side: 'right', align: 'start', className: 'left-auto top-0 -translate-y-1/2 translate-x-1/2' },
    { side: 'right', align: 'end', className: 'bottom-0 translate-x-1/2 translate-y-1/2' },

    { side: 'bottom', align: 'center', className: 'left-1/2 -translate-x-1/2 translate-y-1/2 transform' },
    { side: 'bottom', align: 'start', className: 'left-0 -translate-x-1/2 translate-y-1/2' },
    { side: 'bottom', align: 'end', className: 'right-0 translate-x-1/2 translate-y-1/2' },

    { side: 'left', align: 'center', className: 'left-0 right-auto top-2/4 -translate-x-1/2 -translate-y-1/2' },
    { side: 'left', align: 'start', className: 'top-0  -translate-x-1/2 -translate-y-1/2' },
    { side: 'left', align: 'end', className: 'bottom-0 right-auto -translate-x-1/2 translate-y-1/2' },
  ],
})

export interface IndicatorProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'content'>,
    VariantProps<typeof indicatorVariants> {
  content: ReactNode
}

export const Indicator = forwardRef<ElementRef<'span'>, IndicatorProps>(function Indicator(
  { className, side = 'top', align = 'end', children, content, ...indicatorProps },
  forwardedRef
) {
  return (
    <span ref={forwardedRef} {...indicatorProps} className="relative inline-block">
      {children}
      <span className={twMerge(indicatorVariants({ side, align }), className)}>{content}</span>
    </span>
  )
})

export default Indicator
