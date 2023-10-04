import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const buttonVariants = cva(['inline-flex', 'items-center', 'shrink-0', 'font-medium', 'rounded'], {
  variants: {
    variant: {
      solid: [],
      surface: [],
      outline: [],
    },
    color: {
      brand: [],
      neutral: [],
      green: [],
    },
    size: {
      xs: ['text-xs', 'px-1', 'py-0.5'],
      sm: ['text-sm', 'py-1', 'px-2'],
      md: ['text-base', 'py-1.5', 'px-4'],
    },
  },
  compoundVariants: [
    {
      variant: ['surface', 'outline'],
      color: 'neutral',
      className: ['bg-neutral-100', 'border', 'border-neutral-250', 'text-neutral-400'],
    },
    ...['brand' as const, 'neutral' as const, 'green' as const].map((color) => ({
      variant: 'solid' as const,
      color,
      className: [`bg-${color}-500`, 'border', `border-${color}-500`, 'text-white'],
    })),
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'brand',
    size: 'sm',
  },
})

export interface ButtonProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'color'>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<ElementRef<'button'>, ButtonProps>(function Button(
  { className, color, variant, size, ...buttonProps },
  forwardedRef
) {
  return (
    <button
      {...buttonProps}
      ref={forwardedRef}
      className={twMerge(buttonVariants({ color, size, variant }), className)}
    />
  )
})

export default Button
