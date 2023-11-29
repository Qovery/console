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
    /*
    // Generate all colors
      ...['brand' as const, 'neutral' as const, 'green' as const].map((color) => ({
        variant: 'solid' as const,
        color,
        className: [
          `bg-${color}-500`,
          `hover:bg-${color}-600`,
          'text-white',
          'disabled:text-brand-300',
          `disabled:text-${color}-300`,
          `disabled:bg-${color}-100`,
          `disabled:border-none`,
        ],
      })),
    */
    {
      variant: 'solid',
      color: 'brand',
      className: [
        'bg-brand-500',
        'hover:bg-brand-600',
        'text-white',
        'disabled:text-brand-300',
        'disabled:text-brand-300',
        'disabled:bg-brand-100',
        'disabled:border-none',
      ],
    },
    {
      variant: 'solid',
      color: 'neutral',
      className: [
        'bg-neutral-500',
        'hover:bg-neutral-600',
        'text-white',
        'disabled:text-brand-300',
        'disabled:text-neutral-300',
        'disabled:bg-neutral-100',
        'disabled:border-none',
      ],
    },
    {
      variant: 'solid',
      color: 'green',
      className: [
        'bg-green-500',
        'hover:bg-green-600',
        'text-white',
        'disabled:text-brand-300',
        'disabled:text-green-300',
        'disabled:bg-green-100',
        'disabled:border-none',
      ],
    },
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'brand',
    size: 'sm',
    radius: 'rounded',
  },
})

export interface ButtonPrimitiveProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'color'>,
    VariantProps<typeof buttonVariants> {}

export const ButtonPrimitive = forwardRef<ElementRef<'button'>, ButtonPrimitiveProps>(function ButtonPrimitive(
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

export default ButtonPrimitive
