import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const buttonVariants = cva(['inline-flex', 'items-center', 'shrink-0', 'font-medium', 'rounded', 'transition'], {
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
      sm: ['text-sm', 'h-9', 'px-3'],
      md: ['text-sm', 'h-10', 'px-4'],
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
      className: ['bg-transparent', 'hover:bg-neutral-50'],
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
