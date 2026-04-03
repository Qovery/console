import { type VariantProps, cva } from 'class-variance-authority'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

const badgeVariants = cva(['text-neutral', 'inline-flex', 'items-center', 'shrink-0', 'text-xs', 'px-1.5'], {
  variants: {
    size: {
      base: ['h-6'],
      sm: ['h-5'],
    },
    color: {
      neutral: ['border-neutral'],
      red: ['border-negative-subtle'],
      purple: ['border-accent1-subtle'],
      sky: ['border-info-subtle'],
      green: ['border-positive-subtle'],
      yellow: ['border-warning-subtle'],
      brand: ['border-brand-subtle'],
    },
    variant: {
      outline: ['border'],
      surface: ['border'],
    },
    radius: {
      rounded: ['rounded-md'],
      full: ['rounded-full'],
    },
  },
  compoundVariants: [
    {
      variant: 'surface',
      color: 'neutral',
      className: ['bg-surface-neutral-subtle'],
    },
    {
      variant: 'surface',
      color: 'red',
      className: ['bg-surface-negative-subtle', 'text-negative'],
    },
    {
      variant: 'outline',
      color: 'red',
      className: ['text-negative'],
    },
    {
      variant: 'surface',
      color: 'purple',
      className: ['bg-surface-accent1-component', 'text-accent1'],
    },
    {
      variant: 'outline',
      color: 'purple',
      className: ['text-accent1'],
    },
    {
      variant: 'surface',
      color: 'sky',
      className: ['bg-surface-info-subtle', 'text-info'],
    },
    {
      variant: 'outline',
      color: 'sky',
      className: ['text-info'],
    },
    {
      variant: 'surface',
      color: 'green',
      className: ['bg-surface-positive-subtle', 'text-positive'],
    },
    {
      variant: 'outline',
      color: 'green',
      className: ['text-positive'],
    },
    {
      variant: 'surface',
      color: 'yellow',
      className: ['bg-surface-warning-subtle', 'text-warning'],
    },
    {
      variant: 'outline',
      color: 'yellow',
      className: ['text-warning'],
    },
    {
      variant: 'surface',
      color: 'brand',
      className: ['bg-surface-brand-subtle', 'text-brand'],
    },
    {
      variant: 'outline',
      color: 'brand',
      className: ['text-brand'],
    },
  ],
  defaultVariants: {
    size: 'base',
    variant: 'outline',
    color: 'neutral',
    radius: 'rounded',
  },
})

export interface BadgeProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'color'>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<ElementRef<'span'>, BadgeProps>(function Badge(
  { className, color, variant, radius, size, ...badgeProps },
  forwardedRef
) {
  return (
    <span
      data-accent-color={color}
      {...badgeProps}
      ref={forwardedRef}
      className={twMerge(badgeVariants({ color, variant, radius, size }), className)}
    />
  )
})

export default Badge
