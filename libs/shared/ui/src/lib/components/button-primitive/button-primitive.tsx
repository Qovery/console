import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const _buttonVariants = cva(
  [
    'inline-flex',
    'items-center',
    'shrink-0',
    'font-medium',
    'transition-[background-color,transform]',
    'active:scale-[0.97]',
    'disabled:scale-100',
    'disabled:pointer-events-none',
    'focus-visible:[&:not(:active)]:outline-2',
    'outline-0',
  ],
  {
    variants: {
      variant: {
        solid: [''],
        surface: [''],
        outline: [''],
        plain: [''],
      },
      color: {
        brand: ['outline-neutral'],
        neutral: ['outline-brand'],
        green: ['outline-neutral-500'],
        red: ['outline-red-500'],
        yellow: ['outline-yellow-600'],
      },
      size: {
        xs: ['text-xs', 'h-6', 'px-1.5'],
        sm: ['text-xs', 'h-7', 'px-2'],
        md: ['text-sm', 'h-8', 'px-2.5'],
        lg: ['text-sm', 'h-10', 'px-3'],
      },
      radius: {
        none: [],
        rounded: [],
        full: ['rounded-full'],
      },
    },
    compoundVariants: [
      //sizes
      {
        size: 'xs',
        radius: 'rounded',
        className: ['rounded'],
      },
      {
        size: 'sm',
        radius: 'rounded',
        className: ['rounded'],
      },
      {
        size: 'md',
        radius: 'rounded',
        className: ['rounded-md'],
      },
      {
        size: 'lg',
        radius: 'rounded',
        className: ['rounded-lg'],
      },
      //solid variants
      {
        variant: 'solid',
        color: 'brand',
        className: ['bg-surface-brand-solid', 'hover:bg-surface-brand-solidHover', 'text-neutralInvert'],
      },
      {
        variant: 'solid',
        color: 'neutral',
        className: ['bg-surface-neutralInvert', 'hover:bg-surface-neutralInvert-component', 'text-neutralInvert'],
      },
      {
        variant: 'solid',
        color: 'green',
        className: ['bg-surface-positive-solid', 'hover:bg-surface-positive-solidHover', 'text-neutral-contrasted'],
      },
      {
        variant: 'solid',
        color: 'red',
        className: ['bg-surface-negative-solid', 'hover:bg-surface-negative-solidHover', 'text-neutral-contrasted'],
      },
      {
        variant: 'solid',
        color: 'yellow',
        className: ['bg-surface-warning-solid', 'hover:bg-surface-warning-solidHover', 'text-black'],
      },
      {
        variant: ['surface', 'outline'],
        color: ['neutral', 'red'],
        className: [
          'border',
          'border-neutral-250',
          'text-neutral-400',
          'hover:[&:not(:active)]:border-neutral-300',
          'active:bg-neutral-150',
          'disabled:text-neutral-300',
          'disabled:bg-neutral-100',
          'disabled:border-none',
        ],
      },
      {
        variant: ['surface', 'outline'],
        color: 'neutral',
        className: [
          'border',
          'border-neutral-250',
          'text-neutral-400',
          'hover:[&:not(:active)]:border-neutral-300',
          'active:bg-neutral-150',
          'disabled:text-neutral-300',
          'disabled:bg-neutral',
          'disabled:border-none',
        ],
      },
      {
        variant: ['surface', 'outline'],
        color: 'red',
        className: [
          'border',
          'border-red-500',
          'text-neutral-400',
          'hover:[&:not(:active)]:border-red-500',
          'active:bg-neutral-150',
          'disabled:text-neutral-300',
          'disabled:bg-neutral',
          'disabled:border-none',
        ],
      },
      {
        variant: 'surface',
        color: 'neutral',
        className: ['bg-neutral-100', 'hover:[&:not(:active):not(:disabled)]:bg-white'],
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
          'focus-visible:text-neutral-400',
          'active:bg-neutral-150',
          'active:text-neutral-400',
          'disabled:text-neutral-300',
          'disabled:bg-neutral-150',
          'disabled:border-none',
          'hover:bg-surface-neutral-subtle',
        ],
      },
      {
        variant: 'plain',
        color: 'brand',
        className: [
          'border',
          'border-transparent',
          'text-brand-500',
          'hover:[&:not(:disabled)]:text-brand-700',
          'hover:[&:not(:focus-visible):not(:disabled)]:shadow-none',
          'hover:bg-transparent',
          'focus-visible:text-brand-700',
          'focus-visible:border-transparent',
          'active:bg-transparent',
          'active:text-brand-700',
          'disabled:text-neutral-300',
          'disabled:bg-neutral',
          'disabled:border-none',
          'p-0',
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
