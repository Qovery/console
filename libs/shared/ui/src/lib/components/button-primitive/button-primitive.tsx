import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const _buttonVariants = cva(
  [
    'inline-flex',
    'items-center',
    'shrink-0',
    'font-medium',
    'transition',
    'focus-visible:[&:not(:active)]:outline-2',
    'outline-0',
  ],
  {
    variants: {
      variant: {
        solid: ['shadow-sm', 'disabled:shadow-none', 'active:shadow-none'],
        surface: ['shadow-sm', 'disabled:shadow-none', 'active:shadow-none'],
        outline: ['shadow-sm', 'disabled:shadow-none', 'active:shadow-none', 'bg-white', 'dark:bg-neutral-600'],
        plain: ['hover:[&:not(:focus-visible):not(:disabled)]:shadow-sm', 'active:[&:not(:focus-visible)]:shadow-none'],
      },
      color: {
        brand: ['outline-neutral-500'],
        neutral: ['outline-brand-500'],
        green: ['outline-neutral-500'],
        red: ['outline-neutral-500'],
        yellow: ['outline-yellow-600'],
      },
      size: {
        xs: ['text-xs', 'h-6', 'px-2'],
        sm: ['text-xs', 'h-7', 'px-2'],
        md: ['text-sm', 'h-9', 'px-3'],
        lg: ['text-sm', 'h-11', 'px-5'],
      },
      radius: {
        none: [],
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
          'dark:border-neutral-400',
          'text-neutral-400',
          'dark:text-white',
          'hover:[&:not(:active)]:border-neutral-300',
          'dark:hover:[&:not(:active):not(:disabled)]:border-neutral-350',
          'active:bg-neutral-150',
          'disabled:text-neutral-300',
          'disabled:bg-neutral-100',
          'disabled:border-none',
        ],
      },
      {
        variant: 'surface',
        color: 'neutral',
        className: [
          'bg-neutral-100',
          'dark:bg-neutral-500',
          'hover:[&:not(:active):not(:disabled)]:bg-white',
          'dark:hover:[&:not(:active):not(:disabled)]:bg-neutral-400',
        ],
      },
      {
        // Incomplete, waiting for other occurences to standardize
        variant: 'surface',
        color: 'brand',
        className: [
          'bg-brand-50',
          'border',
          'border-brand-500',
          'text-brand-500',
          'hover:[&:not(:active):not(:disabled)]:bg-white',
        ],
      },
      {
        variant: 'plain',
        color: 'neutral',
        className: [
          'border',
          'border-transparent',
          'text-neutral-350',
          'hover:[&:not(:active):not(:focus-visible)]:border-neutral-300',
          'hover:[&:not(:disabled)]:text-neutral-400',
          'dark:hover:[&:not(:disabled)]:text-neutral-250',
          'focus-visible:text-neutral-400',
          'active:bg-neutral-150',
          'dark:active:bg-transparent',
          'active:text-neutral-400',
          'disabled:text-neutral-300',
          'disabled:bg-neutral-150',
          'disabled:border-none',
        ],
      },
      {
        variant: 'plain',
        color: 'brand',
        className: [
          'border',
          'border-transparent',
          'text-brand-500',
          'hover:[&:not(:active):not(:focus-visible)]:border-neutral-300',
          'hover:[&:not(:disabled)]:text-brand-700',
          'focus-visible:text-brand-700',
          'active:bg-neutral-150',
          'active:text-brand-700',
          'disabled:text-neutral-300',
          'disabled:bg-neutral-150',
          'disabled:border-none',
        ],
      },
      /*
    // Generate all colors
      ...['brand', 'neutral', 'green', 'red'].map((color) => ({
        variant: 'solid',
        color,
        className: [
          `bg-${color}-500`,
          `active:bg-${color}-600`,
          `hover:bg-${color}-400`,
          'text-white',
          'disabled:text-${color}-300',
          `disabled:bg-${color}-100`,
        ],
      })),
    */

      {
        variant: 'solid',
        color: 'brand',
        className: [
          'bg-brand-500',
          'active:bg-brand-600',
          'hover:bg-brand-400',
          'text-white',
          'disabled:text-brand-300',
          'disabled:bg-brand-100',
        ],
      },
      {
        variant: 'solid',
        color: 'neutral',
        className: [
          'bg-neutral-500',
          'active:bg-neutral-600',
          'hover:bg-neutral-400',
          'text-white',
          'disabled:text-neutral-300',
          'disabled:bg-neutral-100',
        ],
      },
      {
        variant: 'solid',
        color: 'green',
        className: [
          'bg-green-500',
          'active:bg-green-600',
          'hover:bg-green-400',
          'text-white',
          'disabled:text-green-300',
          'disabled:bg-green-100',
        ],
      },
      {
        variant: 'solid',
        color: 'red',
        className: [
          'bg-red-500',
          'active:bg-red-600',
          'hover:bg-red-400',
          'text-white',
          'disabled:text-red-300',
          'disabled:bg-red-100',
        ],
      },
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'brand',
      size: 'sm',
      radius: 'rounded',
    },
  }
)

/**
 * We need have different default color depending on the variant.
 * Here are the current default color rules:
 * - solid = brand
 * - outline = neutral
 * - surface = neutral
 */
export function buttonVariants(props: Parameters<typeof _buttonVariants>[0]) {
  if (props?.variant === 'surface' || props?.variant === 'outline' || props?.variant === 'plain') {
    props.color ??= 'neutral'
  }
  return _buttonVariants(props)
}

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
