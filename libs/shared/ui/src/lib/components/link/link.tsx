import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

const linkVariants = cva(['transition', 'font-medium', 'inline-flex', 'flex-center', 'gap-1', 'hover:underline'], {
  variants: {
    color: {
      brand: ['text-brand-500'],
      red: ['text-red-500'],
      sky: ['text-sky-500'],
    },
    size: {
      xs: ['text-xs'],
      ssm: ['text-ssm'],
      sm: ['text-sm'],
    },
  },
  defaultVariants: {
    color: 'sky',
    size: 'sm',
  },
})

export interface BaseLink {
  link: string
  linkLabel?: string
  external?: boolean
}

export interface LinkProps extends Omit<ComponentPropsWithoutRef<'div'>, 'color'>, VariantProps<typeof linkVariants> {
  className?: string
}

export const Link = forwardRef<ElementRef<'div'>, LinkProps>(function Link(
  { children, color, size, className },
  forwardedRef
) {
  return (
    <div className={twMerge(linkVariants({ color, size }), className)} ref={forwardedRef}>
      {children}
    </div>
  )
})

export default Link
