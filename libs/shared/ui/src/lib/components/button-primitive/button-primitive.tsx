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
    'select-none',
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
        brand: ['outline-brand-strong'],
        neutral: ['outline-neutral-strong'],
        green: ['outline-positive-strong'],
        red: ['outline-negative-strong'],
        yellow: ['outline-warning-strong'],
        current: [''],
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
      iconOnly: {
        true: ['justify-center', 'px-0'],
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
      // icon-only sizing (square)
      {
        size: 'xs',
        iconOnly: true,
        className: ['w-6'],
      },
      {
        size: 'sm',
        iconOnly: true,
        className: ['w-7'],
      },
      {
        size: 'md',
        iconOnly: true,
        className: ['w-8'],
      },
      {
        size: 'lg',
        iconOnly: true,
        className: ['w-10'],
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
        className: [
          'bg-surface-neutral',
          'border',
          'border-neutral',
          'hover:border-neutral-component',
          'hover:bg-surface-neutral-subtle',
          'data-[state=open]:bg-surface-neutral-subtle',
          'text-neutral',
        ],
      },
      {
        variant: ['outline'],
        color: 'red',
        className: [
          'border',
          'border-negative-subtle',
          'text-negative',
          'hover:border-negative-component',
          'hover:bg-surface-negative-subtle',
          'data-[state=open]:bg-surface-negative-subtle',
        ],
      },
      {
        variant: ['outline'],
        color: 'yellow',
        className: [
          'border',
          'border-warning-subtle',
          'text-warning',
          'hover:border-warning-component',
          'hover:bg-surface-warning-subtle',
          'data-[state=open]:bg-surface-warning-subtle',
        ],
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
      //plain
      {
        variant: 'plain',
        color: 'neutral',
        className: ['text-neutral-subtle', 'hover:bg-surface-neutral-subtle'],
      },
      {
        variant: 'plain',
        color: 'red',
        className: ['text-negative', 'hover:bg-surface-negative-subtle'],
      },
      {
        variant: 'plain',
        color: 'yellow',
        className: ['text-warning', 'hover:bg-surface-warning-subtle'],
      },
      {
        variant: 'plain',
        color: 'brand',
        className: ['text-brand', 'hover:bg-surface-brand-subtle'],
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
  { className, color, radius, size, variant, iconOnly, ...buttonProps },
  forwardedRef
) {
  return (
    <button
      {...buttonProps}
      ref={forwardedRef}
      className={twMerge(buttonVariants({ color, radius, size, variant, iconOnly }), className)}
    />
  )
})

export default ButtonPrimitive
