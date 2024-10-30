import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const calloutRootVariants = cva(['flex', 'flex-row', 'gap-x-3', 'p-3', 'border', 'rounded', 'text-sm'], {
  variants: {
    color: {
      green: ['border-green-600', 'bg-green-50', 'text-green-500'],
      red: ['border-red-500', 'bg-red-50', 'text-red-500'],
      sky: ['border-sky-500', 'bg-sky-50', 'text-sky-500'],
      yellow: ['border-yellow-600', 'bg-yellow-50', 'text-yellow-700'],
      neutral: ['bg-neutral-100', 'border-neutral-300', 'text-neutral-350'],
    },
  },
})

interface CalloutRootProps
  extends VariantProps<typeof calloutRootVariants>,
    Omit<ComponentPropsWithoutRef<'div'>, 'color'> {}

const CalloutRoot = forwardRef<ElementRef<'div'>, CalloutRootProps>(function CalloutRoot(
  { color, children, className, ...props },
  ref
) {
  return (
    <div data-accent-color={color} {...props} className={twMerge(calloutRootVariants({ color }), className)} ref={ref}>
      {children}
    </div>
  )
})

interface CalloutIconProps extends ComponentPropsWithoutRef<'div'> {}

const CalloutIcon = forwardRef<ElementRef<'div'>, CalloutIconProps>(function CalloutIcon(
  { children, className, ...props },
  ref
) {
  return (
    <div {...props} className={twMerge('-order-2 text-lg leading-6', className)} ref={ref}>
      {children}
    </div>
  )
})

interface CalloutTextProps extends ComponentPropsWithoutRef<'p'> {}

const CalloutText = forwardRef<ElementRef<'div'>, CalloutTextProps>(function CalloutText(
  { children, className, ...props },
  ref
) {
  return (
    <div {...props} className={twMerge('-order-1 mr-auto gap-x-3 text-neutral-400', className)} ref={ref}>
      {children}
    </div>
  )
})

interface CalloutTextHeadingProps extends ComponentPropsWithoutRef<'span'> {}

const CalloutTextHeading = forwardRef<ElementRef<'span'>, CalloutTextHeadingProps>(function CalloutTextHeading(
  { children, className, ...props },
  ref
) {
  return (
    <span {...props} className={twMerge('block font-medium leading-6', className)} ref={ref}>
      {children}
    </span>
  )
})

interface CalloutTextDescriptionProps extends ComponentPropsWithoutRef<'span'> {}

const CalloutTextDescription = forwardRef<ElementRef<'span'>, CalloutTextDescriptionProps>(
  function CalloutTextDescription({ children, className, ...props }, ref) {
    return (
      <span {...props} className={twMerge('text-neutral-400', className)} ref={ref}>
        {children}
      </span>
    )
  }
)

const Callout = Object.assign(
  {},
  {
    Root: CalloutRoot,
    Icon: CalloutIcon,
    Text: CalloutText,
    TextHeading: CalloutTextHeading,
    TextDescription: CalloutTextDescription,
  }
)

export { Callout, CalloutRoot, CalloutIcon, CalloutText, CalloutTextHeading, CalloutTextDescription }

export type {
  CalloutRootProps,
  CalloutIconProps,
  CalloutTextProps,
  CalloutTextHeadingProps,
  CalloutTextDescriptionProps,
}
