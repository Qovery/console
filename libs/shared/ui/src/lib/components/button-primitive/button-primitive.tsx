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
    'disabled:border',
    'disabled:border-neutral',
    'disabled:text-neutral-disabled',
    'disabled:bg-surface-neutral-component',
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
        className: [
          'bg-surface-brand-solid',
          'hover:bg-surface-brand-solidHover',
          'border',
          'border-brand-component',
          'text-neutralInvert',
        ],
      },
      {
        variant: 'solid',
        color: 'neutral',
        className: ['bg-surface-neutralInvert', 'hover:bg-surface-neutralInvert-component', 'text-neutralInvert'],
      },
      {
        variant: 'solid',
        color: 'green',
        className: [
          'bg-surface-positive-solid',
          'hover:bg-surface-positive-solidHover',
          'border',
          'border-positive-component',
          'text-neutral-contrasted',
        ],
      },
      {
        variant: 'solid',
        color: 'red',
        className: [
          'bg-surface-negative-solid',
          'hover:bg-surface-negative-solidHover',
          'border',
          'border-negative-component',
          'text-neutral-contrasted',
        ],
      },
      {
        variant: 'solid',
        color: 'yellow',
        className: [
          'bg-surface-warning-solid',
          'hover:bg-surface-warning-solidHover',
          'border',
          'border-warning-component',
          'text-black',
        ],
      },
      //outline variant
      {
        variant: ['outline'],
        color: 'neutral',
        className: ['bg-surface-neutral', 'border', 'border-neutral', 'hover:border-neutral-component', 'text-neutral'],
      },
      {
        variant: ['outline'],
        color: 'red',
        className: ['border', 'border-negative-subtle', 'text-negative', 'hover:border-negative-component'],
      },
      //surface variant
      {
        variant: 'surface',
        color: 'neutral',
        className: ['bg-surface-neutral-component', 'hover:bg-surface-neutral-componentHover', 'text-neutral'],
      },
      {
        variant: ['surface'],
        color: 'red',
        className: [
          'bg-surface-negative-subtle',
          'border',
          'border-negative-subtle',
          'text-negative',
          'hover:bg-surface-negative-component',
        ],
      },
      {
        variant: 'surface',
        color: 'brand',
        className: [
          'bg-surface-brand-subtle',
          'border',
          'border-brand-subtle',
          'text-brand',
          'hover:bg-surface-brand-component',
        ],
      },
      {
        variant: 'plain',
        color: 'neutral',
        className: ['text-neutral-350', 'hover:bg-surface-neutral-subtle'],
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
