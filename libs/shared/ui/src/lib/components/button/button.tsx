import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const buttonVariants = cva(['inline-flex', 'items-center', 'shrink-0', 'font-medium', 'transition'], {
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
      sm: ['text-xs', 'h-7', 'px-2'],
      md: ['text-xs', 'h-8', 'px-3'],
      lg: ['text-sm', 'h-10', 'px-4'],
    },
    radius: {
      rounded: ['rounded'],
      full: ['rounded-full'],
    },
  },
  compoundVariants: [
    {
      variant: ['surface', 'outline'],
      color: 'neutral',
      className: [
        'border',
        'border-neutral-250',
        'dark:border-neutral-350',
        'text-neutral-400',
        'dark:text-neutral-300',
        'hover:[&:not(:active)]:border-neutral-300',
        'active:bg-neutral-150',
        'disabled:text-neutral-300',
        'disabled:bg-neutral-150',
        'disabled:border-none',
      ],
    },
    {
      variant: 'surface',
      color: 'neutral',
      className: ['bg-neutral-100', 'dark:bg-neutral-500', 'dark:hover:bg-neutral-550'],
    },
    {
      variant: 'outline',
      color: 'neutral',
      className: ['bg-transparent'],
    },
    ...['brand' as const, 'neutral' as const, 'green' as const].map((color) => ({
      variant: 'solid' as const,
      color,
      className: [`bg-${color}-500`, `hover:bg-${color}-600`, 'text-white'],
    })),
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'brand',
    size: 'sm',
    radius: 'rounded',
  },
})

export interface ButtonProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'color'>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<ElementRef<'button'>, ButtonProps>(function Button(
  { className, color, radius, size, variant, ...buttonProps },
  forwardedRef
) {
  return (
    <button
      {...buttonProps}
      ref={forwardedRef}
      className={twMerge(buttonVariants({ color, radius, size, variant }), className)}
    />
  )
})

export default Button
