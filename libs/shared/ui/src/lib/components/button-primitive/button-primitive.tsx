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
    'shadow-sm',
    'disabled:shadow-none',
    'active:shadow-none',
  ],
  {
    variants: {
      variant: {
        solid: ['border'],
        surface: [],
        outline: [],
      },
      color: {
        brand: [],
        neutral: [],
        green: [],
        red: [],
      },
      size: {
        xs: ['text-xs', 'h-5', 'px-1'],
        sm: ['text-xs', 'h-7', 'px-2'],
        md: ['text-xs', 'h-9', 'px-3'],
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
          `border-${color}-500`,
          'hover:border-${color}-600'`
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
          'border-brand-500',
          'hover:border-brand-600',
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
          'border-neutral-500',
          'hover:border-neutral-600',
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
          'border-green-500',
          'hover:border-green-600',
          'hover:bg-green-600',
          'text-white',
          'disabled:text-brand-300',
          'disabled:text-green-300',
          'disabled:bg-green-100',
          'disabled:border-none',
        ],
      },
      {
        variant: 'solid',
        color: 'red',
        className: [
          'bg-red-500',
          'border-red-500',
          'hover:border-red-600',
          'hover:bg-red-600',
          'text-white',
          'disabled:text-brand-300',
          'disabled:text-red-300',
          'disabled:bg-red-100',
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
  if (props?.variant === 'surface' || props?.variant === 'outline') {
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
